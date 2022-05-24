import { Rule } from './Rules.js'


const extractCapital = (str) => str.split('').filter(a => a.match(/[A-Z]/))
const extractLower = (str) => str.split('').filter(a => a.match(/[a-z]/))



export class GrammarFreeLanguage {

  /**
   * 
   * @param {string[]} varsArray 
   * @param {string[]} pseudoRuleArray 
   */
  constructor(varsArray, pseudoRuleArray) {


    this.initialVariable = ''
    this.variables = []
    this.terminals = new Set()
    this.rules = []


    // Se verifica que la entrada de variables cumpla con las reglas de GLC
    // Variables con letras mayusculas y solo una
    for (let variable of varsArray) {
      if (variable.length !== 1) {
        throw `Variable ${variable} should be of length 1`
      }

      if (variable !== variable.toUpperCase()) {
        throw `Variable ${variable} should be uppercase`
      }
    }

    // Se toma la primera varibale como variable inicial
    this.initialVariable = varsArray[0]

    // Se cree el set de variables
    this.variables = new Set(varsArray)

    // Se corrobora que la entrada de variables y reglas
    // coincida en longitud
    if (varsArray.length !== pseudoRuleArray.length) {
      throw 'Variable and Rules don\'t match in length'
    }

    const requiredVariables = []

    for (let i = 0; i < varsArray.length; i++) {

      // Se genera el objeto "regla"
      this.rules.push(new Rule(varsArray[i], pseudoRuleArray[i]))
      // Se consulta si hay alguna variable en las producciones
      // que deba estar presente en las variables
      requiredVariables.push(...extractCapital(pseudoRuleArray[i]))

      // se obtienen las terminales
      extractLower(pseudoRuleArray[i]).forEach((letter) => {
if (this.terminals.has(letter)) return
this.terminals.add(letter)

})


    }

    // Se obtiene el SET de variables que DEBEN
    // estar en variables
    const setFromRequired = new Set(requiredVariables)

    for(let letter of setFromRequired) {
      // Si las variables no cuentan con ella
      // Tira un error
      if(!this.variables.has(letter)) {
        throw `Variable ${letter} not replacable with current rules`
      }
    }





  }

  validateRules() {}

  getVariables() {}


  getTerminals() {}


}
