//////////////////////////////////////////////////////////
// ALGORISMO // ALGORISMO // ALGORISMO
//////////////////////////////////////////////////////////

/*
  GLC A CHONSKI

  types: Variable, Terminal

  FUNCTION INPUT: [
    {
      variable: "S"
      result: [
        Terminal("s"), 
        Terminal("y"), 
        Terminal("m"), 
        Variable("B"), 
        Variable("O"), 
        Terminal("l"), 
        Terminal("s")
        epsilon, : esto es la variable epsilon que esta por ahi
      ]
    }
  ]
*/
const EPSILON = 'ε'

class Production {
  variable
  result = []
  constructor(variable, result) {
    this.variable = variable
    this.result = result
  }

  hasEpsilon() {
    for (const partial of this.result) {
      if (partial instanceof Terminal && partial.value == EPSILON)
        return true
    }
    return false
  }
  
  hasTerminals() {
    for (const partial of this.result) {
      if (partial instanceof Terminal)
        return true
    }
    return false
  }

  isTransitive() {
    return (this.result.length === 1) && (this.result[0] instanceof Variable)
  }

  // Returns new production without epsilons
  removeEpsilons() {
    return new Production(
      this.variable,
      Array.from(this.result).filter(partial => partial.value != EPSILON)
    )
  }
}

class Variable {
  value
  constructor(value) {
    this.value = value
  }

  equals(cosa) {
    return this.value == cosa.value
  }
}

class Terminal {
  value
  constructor(value) {
    this.value = value
  }

  equals(cosa) {
    return this.value == cosa.value
  }
}

const S0 = new Variable("__VARIABLE_S0_FOR_CHOMSKY_OLA__")
class GLC {
  productions = []
  dependencyMapping = {}
  variableMapping = {}
  s0
  constructor(productions, s0) {
    this.productions = []
    this.dependencyMapping = {}
    this.variableMapping = {}
    this.s0 = s0
    for (const production of productions) {
      this.addProduction(production)
    }
  }
  

  getVariablesFromProduction(production) {
    let variables = []
    for (const partialResult of production.result) {
      if (partialResult instanceof Variable) {
        variables.push(partialResult)
      }
    }
    return variables
  }
  updateDependencyMapping(production) {
    const productionVariables = this.getVariablesFromProduction(production)
    for (const variable of productionVariables) {
      if (!Object.keys(this.dependencyMapping).includes(variable.value))
        this.dependencyMapping[variable.value] = []
      this.dependencyMapping[variable.value].push(production)
    }
  }
  updateVariableMapping(production) {
    if (!Object.keys(this.variableMapping).includes(production.variable.value)) {
      this.variableMapping[production.variable.value] = []
    }
    this.variableMapping[production.variable.value].push(production)
  }
  addProduction(production) {
    this.productions.push(production)
    this.updateDependencyMapping(production)
    this.updateVariableMapping(production)
  }
  removeProduction(production) {
    this.productions = this.productions.filter(v => v !== production)
    for (const variable of this.getVariablesFromProduction(production)) {
      this.dependencyMapping[variable.value] = this.dependencyMapping[variable.value].filter(v => v !== production)
    }
    this.variableMapping[production.variable.value] = this.variableMapping[production.variable.value].filter(v => v !== production)
  }

  chomsky() {
    let log = {}

    // Chomsky step 1: Add new S0
    log.step1 = this.chomskyStep1()
    console.log(log)
    // Chomsky step 2: Remove epsilons
    log.step2 = this.chomskyStep2()
    console.log(log)
    // Chomsky step 3: Remove transitivity
    log.step3 = this.chomskyStep3()
    console.log(log)
    // Chomsky step 4: Remove things with length more than 4
    log.step4 = this.chomskyStep4()
    console.log(log)
    // Chomsky step 5: Replace terminals with variables because yea
    log.step5 = this.chomskyStep5()
    console.log(log)
    // Remove duplicated rules
    log.step5dedupe = this.dedupe()
    console.log(log)

    return log
  }

  chomskyStep1() {
    let log = []

    const newProduction = new Production(S0, [this.s0])
    this.addProduction(newProduction)
    log.push({
      what: 'ADDED_S0_PRODUCTION',
      production: newProduction
    })

    log.push({
      what: 'REPLACED_OLD_S0',
      oldValue: this.s0,
      newValue: S0
    })
    this.s0 = S0

    return log
  }
  chomskyStep2() {
    let log = []
    // We first want to know the productions that have epsilon in its result
    let productionsWithEpsilon = this.getProductionsWithEpsilons()

    for (const production of productionsWithEpsilon) {
      // We remove the production with epsilon
      this.removeProduction(production)

      // Then we add the new production without the epsilon
      // only if it produces one or more values
      const productionWithoutEpsilon = production.removeEpsilons()
      if (production.result.length >= 1) {
        this.addProduction(productionWithoutEpsilon)
      }

      // We want to propagate the changes to all the productions that depend
      // on the production variable by adding a production that does not include the variable that we removed
      // if we have B -> ABACA
      // and we want to remove A -> ε
      // then we have B -> ABACA | BACA | ABCA | ABAC | ABC | BAC | BCA | BC
      
      // if we take the index of the matching variable as {0, 2, 4} it is clear that
      // the powerset of {0, 2, 3} without {} constitutes the new productions
      // where the result of a production is generated by removing the elements at the location of the element in the subset

      // we first find all the productions that depend on the variable that we want to remove
      const dependentProductions = Array.from(this.dependencyMapping[production.variable.value])
      // then, for each dependency we want to add new productions without the variable mapping
      for (const dependency of dependentProductions) {

        // first find the indices of the variables to remove
        let indices = []
        for (let i = 0; i < dependency.result.length; i++) {
          const partial = dependency.result[i]
          if (partial.value == production.variable.value)
            indices.push(i)
        }

        
        // then, we create the powerset without []
        let idxPowerset = powerset(indices)

        console.log(idxPowerset)

        
        // the powerset now contains the replacements that we are going to perform over the productions
        // and the productionWithoutEpsilon.result contains the value to add
        let newProductions = []

        for (const replaceIndices of idxPowerset) {
          let result = []
          console.log(replaceIndices)
          for (let i = 0; i < dependency.result.length; i++) {
            if (replaceIndices.includes(i)) {
              // if we find the variable, we replace it with the result of the production
              if (productionWithoutEpsilon.result.length > 0)
                result.push(...productionWithoutEpsilon.result)
            } else {
              result.push(dependency.result[i])
            }
          }
          newProductions.push(new Production(dependency.variable, result))
        }

        // then, we add the productions to the GLC
        for (const production of newProductions) {
          this.addProduction(production)
        }

        log.push({
          what: 'REMOVED_EPSILON_PRODUCTION',
          production: production,
          dependents: dependentProductions,
          newProductions: newProductions,
          newState: this.duplicateGLC()
        })
      }
    }
    return log
  }
  chomskyStep3() {
    let log = []
    // Let's assume that
    // A -> B
    // B -> C | D
    // C -> a
    // D -> E
    // E -> f

    // First iteration
    // A -> C | D
    // B -> C | D
    // C -> a
    // D -> E
    // E -> f

    // Second iteration
    // A -> a | D
    // B -> C | D
    // C -> a
    // D -> E
    // E -> f

    // Third iteration
    // A -> a | E
    // B -> C | D
    // C -> a
    // D -> E
    // E -> f

    // Fourth iteration
    // A -> a | f
    // B -> C | D
    // C -> a
    // D -> E
    // E -> f 

    // ...

    // Assumption: We cannot know (we can but it is hard) beforehand how many iterations are going to be made
    // Note: we do not want to minimize the amount of operations to remove transitivity

    while (this.hasTransitivity()) {
      const transitiveProduction = this.getTransitiveProduction()
      // To remove transitivity we remove the transitive rule
      // Then, we add the rules that are created by solving one iteration of the transitivity
      this.removeProduction(transitiveProduction)
      const transitiveResults = this.variableMapping[transitiveProduction.result[0].value]
      const newProductions = []
      for (const childProduction of transitiveResults) {
        newProductions.push(
          new Production(
          transitiveProduction.variable,
          childProduction.result
          )
        )
      }
      console.log('S3 - Adding new productions: ', newProductions)
      for (const production of newProductions) {
        this.addProduction(production)
      }
      log.push({
        what: 'REMOVED_TRANSITIVE_PRODUCTION',
        production: transitiveProduction,
        matchingProductions: transitiveResults,
        newRules: newProductions,
        newState: this.duplicateGLC()
      })
    }
    return log
  }
  chomskyStep4() {
    let log = []

    let currentX = 1
    for (const production of Array.from(this.productions)) {
      if (production.result.length <= 2)
        continue
      this.removeProduction(production)
      
      // then, we want to divide the production result into multiple productions
      // Y -> A1X1, X1 -> A2X2, X2 -> A3X3, ..., XN-2 -> A_N-1A_N
      let newProductions = []
      if (production.result.length != 2) {
        newProductions.push(new Production(production.variable, [production.result[0], new Variable(`X_${currentX}`)]))
        currentX++
      } else {
        newProductions.push(new Production(production.variable, production.result))
      }
      for (let i = 1; i < production.result.length - 2; i++) {
        newProductions.push(new Production(new Variable(`X_${currentX}`), [production.result[i],new Variable(`X_${currentX+1}`)]))
        currentX++
      }
      if (production.result.length != 2) {
        newProductions.push(new Production(new Variable(`X_${currentX-1}`), [production.result[production.result.length-2], production.result[production.result.length-1]]))
      }

      for (const newProduction of newProductions) {
        this.addProduction(newProduction)
      }

      log.push({
        what: 'DIVIDED_PRODUCTION',
        production: production,
        newProductions: newProductions,
        newState: this.duplicateGLC(),
      })
    }

    return log
  }
  chomskyStep5() {
    let log = []

    // we first want to identify the productions that have mixed variables with terminals
    let currentZ = 1
    let terminalMapping = {}
    let modifiedProductions = []
    console.log('S5 - Current productions: ', this.productions)
    for (const production of Array.from(this.productions)) {
      if ((production.result.length < 2) || (!production.hasTerminals()))
        continue
      this.removeProduction(production)
      
      let newResult = []
      for (const partial of production.result) {
        if (partial instanceof Terminal) {
          if (!Object.keys(terminalMapping).includes(partial.value)) {
            terminalMapping[partial.value] = new Variable(`Z_${currentZ}`)
            currentZ++
          }
          newResult.push(terminalMapping[partial.value])
        } else {
          newResult.push(partial)
        }
      }
      let newProduction = new Production(production.variable, newResult)
      this.addProduction(newProduction)

      log.push({
        what: 'REMOVED_MIXED_TERMINALS',
        production: production, 
        newProduction: production,
        newState: this.duplicateGLC()
      })
    }
    for (const terminal of Object.keys(terminalMapping)) {
      let newProduction = new Production(terminalMapping[terminal], [new Terminal(terminal)])
      this.addProduction(newProduction)
    }

    return log
  }
  dedupe() {
    let logs = []
    let oldState = this.duplicateGLC()

    function areProductionsEqual(lhs, rhs) {
      if (lhs.variable.value != rhs.variable.value)
        return false
      for(const [l, r] of zip(lhs.result, rhs.result)) {
        if (typeof l != typeof r)
          return false
        if (l.value != r.value)
          return false
      }
      return true
    }
    let deduped = []
    for (const actualProd of Array.from(this.productions)) {
      let alreadyExisting = false
      for (const uniqueProduction of Array.from(deduped)) {
        if (areProductionsEqual(actualProd, uniqueProduction)) {
          alreadyExisting |= true
          break
        }
      }
      if (!alreadyExisting) {
        deduped.push(actualProd)
      }
    }

    this.productions = []
    this.variableMapping = []
    this.dependencyMapping = []
    for (const uniqueProduction of deduped) {
      this.addProduction(uniqueProduction)
    }

    return [{
      what: 'DEDUPE_PRODUCTIONS',
      logs: logs,
      oldState: oldState,
      newState: this.duplicateGLC()
    }]
    
  }


  // Just gets one transitive rule, it is not important which one it is
  getTransitiveProduction() {
    for (const production of this.productions) {
      if (production.isTransitive())
        return production
    }
  } 

  hasTransitivity() {
    return this.getTransitiveProduction() !== undefined
  }

  removeEpsilonVariableFromProduction() {
    // To remove epsilon from this 
    // B -> ABACA
    // we have add these productions
    // B -> BACA | ABCA | ABAC | ABC | BAC | BCA | BC
    // 7
    // it is clear that this 
  }
  getProductionsWithEpsilons() {
    let result = []
    for (const production of this.productions) {
      if (production.hasEpsilon() && production !== this.s0) {
        result.push(production)
      }
    }
    return result
  }

  duplicateGLC() {
    return new GLC(
      Array.from(this.productions),
      this.s0
    )
  }
}




const variableStrings = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
function normalizeProductionResult(resultString) { 
  let normalizedProductions = []
  for (const c of resultString) {
    if (variableStrings.includes(c)) {
      normalizedProductions.push(new Variable(c))
    } else {
      normalizedProductions.push(new Terminal(c))
    }
  }
  return normalizedProductions
}

// Converts productions from
// glcVars and glcTerms to a dependency mapping
function normalizeGLC(glcVars, glcTerms, s0) {
  // First, we normalize the productions to a list of productions
  let productions = []

  for (const [glvar, glres] of zip(glcVars, glcTerms)) {
    const variable = new Variable(glvar)
    const result = normalizeProductionResult(glres)
    const production = new Production(variable, result)
    productions.push(production)
  }

  // Then, we create a GLC with the production list and s0
  return new GLC(productions, new Variable(s0))
}

