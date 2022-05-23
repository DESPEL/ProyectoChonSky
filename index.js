const calculator = document.querySelector('.fcgcalculator')
const keys = document.querySelector('.calculator__keys')
const display = document.querySelector('.calculator__display1')
const displayVar = document.querySelector('.variable__display')
const arrow_display = document.querySelector('.arrow__display')
const displayGLC = document.querySelector('.calculator__display3')
const pbr = document.createElement('br')
var var_index = 0
var glcVars = []
var glcTerms = []

keys.addEventListener('click', e => {
  if (e.target.matches('button')) {
    //action
    const key = e.target
    const action = key.dataset.action
    const keyContent = key.textContent
    const displayedVar = displayVar.textContent
    const displayedChar = display.textContent
    const displayedArrow = arrow_display.textContent
    var displayedGLC = displayGLC.textContent
    const previousKeyType = calculator.dataset.previousKeyType
    const vars =  ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","T","U","V","W","X","Y","Z"]
    var usedVars = []
    
    if (!action) {
      if (displayedChar === '') {
        display.textContent = keyContent
      } 
      else {
        display.textContent = displayedChar + keyContent
      }
    }
    
    if ( action == 'add_rule') {
      if (displayedGLC === '') {
        displayGLC.textContent = displayedVar + displayedArrow + displayedChar
        displayedGLC = displayGLC.textContent
        glcVars.push(displayedVar)
        if(!displayedGLC.includes('|')) {
          glcTerms.push(displayedChar)
        } else {
          let or_count = displayedChar.split('|').length-1
          displayedChar.replace('|', ' ')
          glcTerms = displayedChar.split('|', or_count+1)
          for (let i=0; i<or_count; i++) {
            glcVars.push(displayedVar)
          }
        }
      } else {
        
        let temp_array = []
        displayedGLC = displayGLC.textContent + '\r'
        displayGLC.textContent = displayedGLC + displayedVar + displayedArrow + displayedChar
        if(!displayedGLC.includes('|')) {
          glcVars.push(displayedVar)
          glcTerms.push(displayedChar)
        } else {
          let or_count = displayedChar.split('|').length
          displayedChar.replace('|', ' ')
          temp_array = displayedChar.split('|', or_count+1)
          
          for (let i=0; i<or_count; i++) {
            glcVars.push(displayedVar)
            glcTerms.push(temp_array[i])
          }
        }
        
      }
      displayVar.textContent = vars[var_index]
      display.textContent = ''
      var_index+=1
      console.log('vars', glcVars)
      console.log('rules', glcTerms)
    }
    
    if (action == 'clear') {
      console.log('clear key')
    }
    
    if (action == 'calculate') {
      console.log('calculate key')
    }
  }
})


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

class Variable {
  value
  constructor(value) {
    this.value = value
  }

  equals(cosa) {
    return this.value == cosa.value
  }
}
const epsilon = new Variable("__EPSILON__SUPER__VALUE__IDK__")
const s0 = new Variable("__VARIABLE_S0_FOR_CHOMSKY_OLA__")

class Terminal {
  value
  constructor(value) {
    this.value = value
  }

  equals(cosa) {
    return this.value == cosa.value
  }
}

function convertToChomsky(glc) {
  steps_log = {}
  // 1. Add S0
  
  // 2. Remove Epsilons

  // 3. Remove transitivity

  // 4. Convert from S -> A1,A2,A3,...,AN to S->A1X1, X1->A2X2, X2->A3X3, ..., X-> AN-2AXN-2 ,XN-2->AN-1AN

  // 5. Replace variables in SS | S is (T or V)

}

function chomskyStep1() {
  
}

import './scripts/index.js'