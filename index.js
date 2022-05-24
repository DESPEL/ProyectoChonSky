const calculator = document.querySelector(".fcgcalculator");
const keys = document.querySelector(".calculator__keys");
const display = document.querySelector(".calculator__display1");
const displayVar = document.querySelector(".variable__display");
const arrow_display = document.querySelector(".arrow__display");
const displayGLC = document.querySelector(".calculator__display3");
const pbr = document.createElement("br");
const epsilon = document.querySelector(".bepsilon");
const fncfield = document.getElementById('rules')



let glcres

var var_index = 0;
var glcVars = [];
var glcTerms = [];
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

keys.addEventListener("click", (e) => {
  if (e.target.matches("button")) {
    //action
    const key = e.target;
    const action = key.dataset.action;
    const keyContent = key.textContent;
    const displayedEpsilon = epsilon.textContent;
    const displayedVar = displayVar.textContent;
    const displayedChar = display.textContent;
    const displayedArrow = arrow_display.textContent;
    var displayedGLC = displayGLC.textContent;
    const previousKeyType = calculator.dataset.previousKeyType;

    var usedVars = [];

    if (!action) {
      if (displayedChar === "") {
        display.textContent = keyContent;
      } else {
        display.textContent = displayedChar + keyContent;
      }
    }

    if (action == "add_rule") {
      if (displayedGLC === "") {
        displayGLC.textContent = displayedVar + displayedArrow + displayedChar;

        displayedGLC = displayGLC.textContent;

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
        displayedGLC = displayGLC.textContent + "\r";
        displayGLC.textContent =
          displayedGLC + displayedVar + displayedArrow + displayedChar;
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
      display.textContent = "";
      var_index += 1;
      console.log("vars", glcVars);
      console.log("rules", glcTerms);
    }

    if (action == "clear") {
      location.reload(true);
      console.log("clear");
    }

    if (action == "calculate") {
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
