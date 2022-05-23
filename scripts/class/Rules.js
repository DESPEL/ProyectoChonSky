

export class Rule {
/**
 * 
 * @param {string} variable 
 * @param {string} product 
 */
  constructor(variable, product) {

    if (variable.length !== 1) {
      throw `Left hand side of the rule should be one, received ${variable}`
    }

    if (variable.toUpperCase() !== variable) {
      throw `The variable ${variable} is a symbol`
    }

    this.variable = variable
    this.product = product
  }

}

