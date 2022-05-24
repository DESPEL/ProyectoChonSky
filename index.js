const calculator = document.querySelector(".fcgcalculator");
const keys = document.querySelector(".calculator__keys");
const display = document.querySelector(".calculator__display1");
const displayVar = document.querySelector(".variable__display");
const arrow_display = document.querySelector(".arrow__display");
const displayGLC = document.querySelector('.calculator__display3');
const epsilon = document.querySelector(".bepsilon");
const fncfield = document.getElementById('rules')



let glcres

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
document.getElementById("graph").style.display='none';
document.getElementById("FNC_title").style.display='none';

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
      //let dupcount = glcVars.filter(x=>x==glcVars[glcVars.length-1]).length;
      /*console.log("displayedRules: ", displayedRules);
      console.log("rules index", displayedRules_index);
      console.log("var index", var_index);
      console.log("RULE ADDED");
      console.log("vars", glcVars);
      console.log("rules", glcTerms);
      console.log("current glc:", displayGLC.textContent);
      console.log("current displayed Var: ", displayedVar);
      console.log("current var: ", glcVars[(glcVars.length)-1]);
      console.log("last var count:", dupcount);
      */
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
      //console.log("displayedRules: ", displayedRules);
      //console.log("var index", var_index);
      //console.log("rules index", displayedRules_index);
      //console.log("current glc", displayGLC.textContent);
      //console.log("vars", glcVars);
      //console.log("rules", glcTerms);
      //console.log("last displayed Var: ", displayedVar);
      //console.log("last var in glcVars: ", glcVars[(glcVars.length)-1]);
      console.log("REMOVE RULE");
      console.log("RULE REMOVED");
      console.log("vars", glcVars);
      console.log("rules", glcTerms);
    }

    if (action == "reset") {
      location.reload(true);
      console.log("reset");
    }

    if (action == "calculate") {
      document.getElementById("FNC_title").style.display='';
      console.log("Calculate ? idk");
      let glc = normalizeGLC(glcVars, glcTerms, "S");
      let resu = glc.chomsky()

      let res = glc.prettyPrint()
      let html = ''
      console.log(res)
      for (const [key, value] of Object.entries(res)) {
        console.log(key)
        if (key == glc.s0.value) {
          html = "$ " + key + " \\rightarrow " + value.join(" | ") + "$ <br> " + html

        }
        else {
          html += "$ " + key + "\\rightarrow " + value.join(" | ") + "$ <br> "
        }

      }
      showSteps(resu)
      glcres = resu
      console.log(html)
      fncfield.innerHTML = html

      render()




    }

    if (action == "calculate_pushdown") {
      document.getElementById("graph").style.display='';
      document.getElementById("PD_display").style.display='';
      initPushdown(glcVars, glcTerms)
    }

  }
});

const processField = document.getElementById("process")
let processStep = 0
let processKeys = ["step1", "step2", "step3", "step4", "step5"]
function showSteps(results) {
  console.log("RESULTS", results)
  listedActions = ''
  let actualStep = 0
  let state
  let prevState
  let prevs = false


  const stepLog = results[processKeys[processStep]]
  console.log(stepLog)
  if (stepLog.log.length > 0) {
    state = stepLog.log[stepLog.log.length - 1].newState
  } else {
    prevs = true
  }

  for (const action of stepLog.steps) {
    listedActions += action + "<br> "
  }



  if (processStep == 2) {
    console.log("****2", results)
    state = results['step3dedupe'][0]['newState']
  }
  if (processStep == 4) {
    console.log("****4")
    state = results['step5dedupe'][0]['newState']
  }
  console.log(state)
  let html = ''

  if (prevs) {
    state = getPrevState(processStep - 1, results)
  }
  console.log("------------------", prevState, state, actualStep, processStep)
  for (const [key, value] of Object.entries(state.prettyPrint())) {
    if (key == state.s0.value) {
      html = "$ " + key + " \\rightarrow " + value.join(" | ") + "$ <br> " + html

    }
    else {
      html += "$ " + key + "\\rightarrow " + value.join(" | ") + "$ <br> "
    }

  }

  if (prevs) html = "There is no need to do this step <br> " + html


  processField.innerHTML = listedActions + "END STATE <br> " + html



  render()
}

function render() {
  AMtranslated = false
  translate()
}

function nextStep() {
  processStep += 1
  console.log(glcres, processStep)
  showSteps(glcres)
}
function previousStep() {
  processStep -= 1
  showSteps(glcres)
}

function getPrevState(step, results) {


  let actualStep = 0
  let state
  let prevs = false

  for (const i of Object.values(results)) {

    if (actualStep > step) break
    if (actualStep != step) {
      actualStep += 1
      continue
    }


    if (!i.steps) {

      continue
    }
    if (i.log.length == 0) {
      prevs = true
    }
    else {
      state = i.log[i.log.length - 1].newState
    }
    if (actualStep == step) {
      actualStep += 1
    }

    if (step == 2) {

      state = results['step3dedupe'][0]['newState']
    }
    if (step == 4) {

      state = results['step5dedupe'][0]['newState']
    }

    if (prevs) return getPrevState(step - 1, results)
    return state


  }


}
