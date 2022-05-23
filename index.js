const calculator = document.querySelector(".fcgcalculator");
const keys = document.querySelector(".calculator__keys");
const display = document.querySelector(".calculator__display1");
const displayVar = document.querySelector(".variable__display");
const arrow_display = document.querySelector(".arrow__display");
const displayGLC = document.querySelector('.calculator__display3');
const epsilon = document.querySelector(".bepsilon");
const fncfield = document.getElementById('rules')
var var_index = 0;
var displayedRules_index = 0;
var glcVars = [];
var glcTerms = [];
var displayedRules = [];
const vars = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];

import {initPushdown} from './scripts/index.js'
document.getElementById("PD_display").style.display='none';

keys.addEventListener("click", (e) => {
  if (e.target.matches("button")) {
    //action
    const key = e.target;
    const action = key.dataset.action;
    const keyContent = key.textContent;
    const displayedEpsilon = epsilon.textContent;
    var displayedVar = displayVar.textContent;
    const displayedChar = display.textContent;
    const displayedArrow = arrow_display.textContent;
    var displayedGLC = displayGLC.textContent;
    const previousKeyType = calculator.dataset.previousKeyType;

    if (!action) {
      if (displayedChar === "") {
        display.textContent = keyContent;
      } else {
        display.textContent = displayedChar + keyContent;
      }
    }

    if (action == "add_rule") {
      if (displayedGLC === "") {
        displayGLC.textContent = displayedVar + displayedArrow + displayedChar + "\n";
        displayedGLC = displayGLC.textContent;
        displayedRules.push(displayedGLC);
        glcVars.push(displayedVar);
        if (!displayedGLC.includes("|")) {
          glcTerms.push(displayedChar);
        } else {
          let or_count = displayedChar.split("|").length - 1;
          displayedChar.replace("|", " ");
          glcTerms = displayedChar.split("|", or_count + 1);
          for (let i = 0; i < or_count; i++) {
            glcVars.push(displayedVar);
          }
        }
      } else {
        let temp_array = [];
        displayGLC.textContent =
          displayedGLC + displayedVar + displayedArrow + displayedChar + "\n";
        displayedGLC = displayGLC.textContent;
        displayedRules.push(displayedGLC);
        if (!displayedGLC.includes("|")) {
          glcVars.push(displayedVar);
          glcTerms.push(displayedChar);
        } else {
          let or_count = displayedChar.split("|").length;
          displayedChar.replace("|", " ");
          temp_array = displayedChar.split("|", or_count + 1);

          for (let i = 0; i < or_count; i++) {
            glcVars.push(displayedVar);
            glcTerms.push(temp_array[i]);
          }
        }
      }
      displayVar.textContent = vars[var_index];
      displayedVar = displayVar.textContent;
      display.textContent = "";
      var_index += 1;
      displayedRules_index += 1;
      console.log("RULE ADDED");
      console.log("vars", glcVars);
      console.log("rules", glcTerms);
    }

    if (action == "clear") {
      display.textContent = "";
      console.log("clear");
    }

    if (action == "remove_rule") {
      if (!(displayGLC.textContent === "")) {
        let dupcount = glcVars.filter(
          (x) => x == glcVars[glcVars.length - 1]
        ).length;
        while (dupcount > 0) {
          glcVars.pop();
          glcTerms.pop();
          dupcount--;
        }
        var_index = var_index - 1;
        console.log(vars[var_index]);
        console.log(glcVars[var_index]);
        displayedRules_index -= 1;
        displayedRules.pop();
        if (var_index <= 0) {
          displayVar.textContent = "S";
          var_index = 0;
          displayedRules_index = 0;
          displayGLC.textContent = "";
        } else {
          displayVar.textContent = vars[var_index - 1];
          displayGLC.textContent = displayedRules[displayedRules_index - 1];
        }
        displayedVar = displayVar.textContent;
      }
      console.log("RULE REMOVED");
      console.log("vars", glcVars);
      console.log("rules", glcTerms);
    }

    if (action == "reset") {
      location.reload(true);
      console.log("reset");
    }

    if (action == "calculate") {
      console.log("Calculate ? idk");
      let glc = normalizeGLC(glcVars, glcTerms, "S");
      console.log(glc.chomsky());
      let res = glc.prettyPrint()
      let html = ''
      console.log(res)
      for(const [key,value] of Object.entries(res)){
        console.log(key)
        if(key == glc.s0.value){
          html = key + displayedArrow + value.join(" | ") + " <br> " + html
          
        }
        else{
        html += key + displayedArrow + value.join(" | ") + " <br> "
        }
        
      }
      console.log(html)
      fncfield.innerHTML = html
    }

    if (action == "calculate_pushdown") {
      document.getElementById("PD_display").style.display='';
      initPushdown(glcVars, glcTerms)
    }

  }
})
