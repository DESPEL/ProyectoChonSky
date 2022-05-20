const calculator = document.querySelector(".fcgcalculator");
const keys = document.querySelector(".calculator__keys");
const display = document.querySelector(".calculator__display1");
const displayVar = document.querySelector(".variable__display");
const arrow_display = document.querySelector(".arrow__display");
const displayGLC = document.querySelector(".calculator__display3");
const pbr = document.createElement("br");
const epsilon = document.querySelector(".bepsilon");
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
    const displayedVar = displayVar.innerHTML;
    const displayedChar = display.textContent;
    const displayedArrow = arrow_display.textContent;
    var previousDisplayedGLC = displayGLC.textContent;
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
        previousDisplayedGLC = "";
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
        previousDisplayedGLC = displayGLC.textContent;
        displayedGLC = displayGLC.textContent;
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
      console.log("var index", var_index);
      console.log("vars", glcVars);
      console.log("rules", glcTerms);
      console.log("previousglc", previousDisplayedGLC);
    }

    if (action == "clear") {
      display.textContent = "";
      console.log("clear");
    }

    if (action == "remove_rule") {
      if (!(displayGLC.textContent === "")) {
        var_index = var_index - 1;
        if (var_index <= 0) {
          displayVar.textContent = "S";
          var_index = 0;
        } else {
          displayVar.textContent = vars[var_index - 1];
        }
      }
      displayGLC.textContent = previousDisplayedGLC;
      console.log("previousglc", previousDisplayedGLC);
      console.log("var index", var_index);
      //displayVar.textContent = vars[var_index - 1];
      console.log("REMOVE RULE");
    }

    if (action == "reset") {
      location.reload(true);
      console.log("reset");
    }

    if (action == "calculate") {
      console.log("Calculate ? idk");
      let glc = normalizeGLC(glcVars, glcTerms, "S");
      console.log(glc.chomsky());
    }
  }
});
