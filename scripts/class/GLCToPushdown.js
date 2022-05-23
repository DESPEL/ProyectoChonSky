import { PushdownTransition } from "./PushdownTransition.js";
import { GrammarFreeLanguage } from "./GLC.js";

const EPSILON = "ϵ";

function uuidv4() {
	return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
		(
			c ^
			(crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
		).toString(16)
	);
}

const scale = 0.8;
function attributer(datum, index, nodes) {
    var selection = d3.select(this);
    if (datum.tag == "svg") {
        datum.attributes = {
            ...datum.attributes,
            width: '100%',
            height: '100%',
        };
        // svg is constructed by hpcc-js/wasm, which uses pt instead of px, so need to convert
        const px2pt = 3 / 4;

        // get graph dimensions in px. These can be grabbed from the viewBox of the svg
        // that hpcc-js/wasm generates
        const graphWidth = datum.attributes.viewBox.split(' ')[2] / px2pt;
        const graphHeight = datum.attributes.viewBox.split(' ')[3] / px2pt;

        // new viewBox width and height
        const w = graphWidth / scale;
        const h = graphHeight / scale;

        // new viewBox origin to keep the graph centered
        const x = -(w - graphWidth) / 2;
        const y = -(h - graphHeight) / 2;

        const viewBox = `${x * px2pt} ${y * px2pt} ${w * px2pt} ${h * px2pt}`;
        selection.attr('viewBox', viewBox);
        datum.attributes.viewBox = viewBox;
    }
}

export class GLCToPushdownTransformation {
	/**
	 *
	 * @param {GrammarFreeLanguage} originalGLC
	 */
	constructor(originalGLC) {
		this.snapshots = [];

		this.modifications = [
			{ modification: {}, description: "Se crea el automata" },
		];

		this.automata = {
			states: new Set(),
			/** @type {PushdownTransition[]} */
			transitions: [],
			initialState: null,
			acceptanceStates: new Set(),
			terminals: new Set(),
			stackTerms: new Set(),
		};

		this.addStep(
			{ add: { terminals: [...originalGLC.terminals, EPSILON] } },
			"El alfabeto del automata de pila, equivale al alfabeto de la gramatica de libre contexto"
		);

		this.addStep(
			{
				add: {
					stackTerms: [
						...originalGLC.terminals,
						...originalGLC.variables,
						"$",
						EPSILON,
					],
				},
			},
			"El alfabeto de la pila, equivale a las terminales de la GLC, así como sus variables, y un marcador "
		);

		this.addStep(
			{ add: { states: ["qi"], initialState: "qi" } },
			"Se crea el estado inicial qi"
		);

		this.addStep(
			{ add: { states: ["qc"] } },
			"Se crea el estado de ciclo qc"
		);

		this.addStep(
			{
				add: {
					transitions: [
						new PushdownTransition(
							EPSILON,
							EPSILON,
							`${originalGLC.initialVariable}$`,
							"qi",
							"qc"
						),
					],
				},
			},
			"Se agrega la transición entre el estado inicial y el de ciclo, que lee epsilon, saca epsilon de la pila, e ingresa la variable inicial y el marcador"
		);

		this.addStep(
			{ add: { states: ["qa"], acceptanceStates: ["qa"] } },
			"Se crea el estado de aceptacion qa"
		);

		this.generateDotText();

		this.addStep(
			{
				add: {
					transitions: [
						new PushdownTransition(
							EPSILON,
							"$",
							EPSILON,
							"qc",
							"qa"
						),
					],
				},
			},
			"Se agrega la transición entre el estado ciclo y el de aceptacion, que lee epsilon, saca el marcador de la pila, e ingresa epsilon"
		);

		this.generateDotText();

		this.addStep(
			{},
			"Se agregan transiciones para cada una de las producciones de las variables de la GLC"
		);

		for (let rule of originalGLC.rules) {
			this.addStep(
				{
					add: {
						transitions: [
							new PushdownTransition(
								EPSILON,
								rule.variable,
								rule.product,
								"qc",
								"qc"
							),
						],
					},
				},
				`Se agrega un ciclo en qc para la regla ${rule.variable} -> ${rule.product}, con epsilon como caracter de lectura`
			);

			this.generateDotText();
		}

		this.addStep(
			{},
			"Se agregan transiciones para cada una de las terminales de la GLC"
		);

		for (let terminal of originalGLC.terminals) {
			this.addStep(
				{
					add: {
						transitions: [
							new PushdownTransition(
								terminal,
								terminal,
								EPSILON,
								"qc",
								"qc"
							),
						],
					},
				},
				`Se agrega un ciclo en qc para la lectura de ${terminal}, se saca ${terminal} de la pila, y no se inserta nada`
			);

			this.generateDotText();
		}

		this.generateDotText();

		this.addStep({}, "Se termina la version sintetizada");

		this.detailDiagram();

		this.generateDotText();

		//this.printDiagram();
		this.d3Diagram();
	}

	d3Diagram() {
		var dotIndex = 0;
		var graphviz = d3
			.select("#graph")
			.graphviz("", { logEvents: false })
			.attributer(attributer)
			.logEvents(false)
			.transition(function () {
				return d3
					.transition("main")
					.ease(d3.easeLinear)
					.delay(3000)
					.duration(1500);
			})
			.logEvents(true)
			.on("initEnd", render(this));

		function render(automata) {
			return function renderCallback() {
				var dot = automata.snapshots[dotIndex];
				graphviz.renderDot(dot).on("end", function () {
					dotIndex = (dotIndex + 1) % automata.snapshots.length;
					renderCallback();
				});
			};
		}
	}

	generateDotText() {
		this.stateMachine = new StateMachine({
			init: this.automata.initialState,
			transitions: this.automata.transitions.map((rule) => {
				return {
					name: `${rule.read}, ${rule.pop} -> ${rule.push}`,
					from: rule.origin,
					to: rule.destination,
				};
			}),
		});

		const diagramText = StateMachineVisualize(this.stateMachine);

		let editableDiagramText = diagramText.substring(
			0,
			diagramText.length - 1
		);
		editableDiagramText +=
			'  "init" [label="", shape=none];\n  "init" -> "qi" [ label="" ];\n  "qa" [shape=doublecircle];\n';

		for (let state of this.automata.states) {
			if (!["qi", "qa", "qc"].includes(state)) {
				editableDiagramText += `  "${state}" [label=""];\n`;
			}
		}

		const constructingCycleTransitions = editableDiagramText
			.split("\n")
			.filter((line) => line.startsWith('  "qc" -> "qc"'));

		const rulesToAppend = constructingCycleTransitions.map((rule) => {
			return rule.match(/(?<=label=")(.*)?(?=")/g);
		});

		const merged = rulesToAppend.length !== 0 ? rulesToAppend.reduce((prev, curr, idx, arr) => {
			return prev.replace(
				"{RULEHERE}",
				`${curr} ${idx === arr.length - 1 ? "" : `\n {RULEHERE}`}`
			);
		}, '  "qc" -> "qc" [ label="{RULEHERE}" ];') : null;


		if (merged !== null) {
			editableDiagramText = [
				...editableDiagramText
					.split("\n")
					.filter((line) => !line.startsWith('  "qc" -> "qc"')),
				merged,
			].reduce((prev, curr) => prev + curr, "");
		}

		editableDiagramText += "}";
		this.snapshots.push(editableDiagramText);

	}

	printDiagram() {
		new Viz()
			.renderSVGElement(this.snapshots[this.snapshots.length - 1])
			.then((elem) => {
				document.body.appendChild(elem);
			});
	}

	/**
	 * @typedef {object} modifier
	 * @property {string[]} states
	 * @property {string} initialState
	 * @property {string[]} acceptanceStates
	 * @property {PushdownTransition[]} transitions
	 * @property {string[]} terminals
	 * @property {string[]} stackTerms
	 */

	/**
	 * @typedef {object} StepObject
	 * @property {modifier} add
	 * @property {modifier} remove
	 */

	/**
	 *
	 * @param {StepObject} modification
	 * @param {string} description
	 */
	addStep(modification, description) {
		this.modifications.push({ modification, description });

		if (modification.add) {
			const op = modification.add;

			if (op.states && Array.isArray(op.states)) {
				for (let state of op.states) {
					if (this.automata.states.has(state))
						throw "State already in automata";
					this.automata.states.add(state);
				}
			}

			if (
				op.terminals &&
				(Array.isArray(op.terminals) || op.terminals instanceof Set)
			) {
				for (let terminal of op.terminals) {
					if (this.automata.terminals.has(terminal))
						throw "Terminal already in automata";

					this.automata.terminals.add(terminal);
				}
			}

			if (
				op.stackTerms &&
				(Array.isArray(op.stackTerms) || op.stackTerms instanceof Set)
			) {
				for (let stackTerminal of op.stackTerms) {
					if (this.automata.stackTerms.has(stackTerminal)) continue;
					this.automata.stackTerms.add(stackTerminal);
				}
			}

			if (op.initialState && typeof op.initialState === "string") {
				if (!this.automata.states.has(op.initialState))
					throw "IS: Is not in automata states";
				this.automata.initialState = op.initialState;
			}

			if (op.acceptanceStates && Array.isArray(op.acceptanceStates)) {
				for (let acState of op.acceptanceStates) {
					if (!this.automata.states.has(acState))
						throw `AS: State ${acState} not in automata states`;
					this.automata.acceptanceStates.add(acState);
				}
			}

			if (op.transitions && Array.isArray(op.transitions)) {
				let filteredTransitions = op.transitions;

				for (let currentTransition of this.automata.transitions) {
					filteredTransitions = filteredTransitions.filter(
						(rule) => !currentTransition.equals(rule)
					);
				}

				for (let proposedTransition of filteredTransitions) {
					if (!proposedTransition.validTransitionFor(this.automata))
						throw `Not Valid Transition ${JSON.stringify(
							proposedTransition
						)}`;

					this.automata.transitions.push(proposedTransition);
				}
			}
		}
		if (modification.remove) {
			const removeOp = modification.remove;

			if (removeOp.transitions && Array.isArray(removeOp.transitions)) {
				for (let idxToRemove of removeOp.transitions) {
					this.automata.transitions.splice(idxToRemove, 1);
				}
			}
		}
	}

	flush() {
		this.automata = {
			states: new Set(),
			/** @type {PushdownTransition[]} */
			transitions: [],
			initialState: null,
			acceptanceState: null,
			terminals: new Set(),
			stackTerms: new Set(),
		};
	}

	detailDiagram() {
		for (let ruleIdx in this.automata.transitions) {
			const rule = this.automata.transitions[ruleIdx];
			const shouldBeReplaced = rule.push.length > 1;
			if (shouldBeReplaced) {
				this.replaceTransition(rule, ruleIdx);
			}
		}

		this.deleteInvalidTransitions();
	}

	deleteInvalidTransitions() {
		this.addStep(
			{},
			"Se remueven las transiciones que quedan repetidas, consecuencia del detalle"
		);

		this.automata.transitions = this.automata.transitions.filter(
			(rule) => rule.push.length <= 1
		);
	}
	/**
	 *
	 * @param {PushdownTransition} rule
	 * @param {number} ruleIdx
	 */
	replaceTransition(rule, ruleIdx) {
		//this.automata.transitions.splice(ruleIdx)

		let shouldKeepBreaking = true;
		let ruleToBreak = rule;

		const explainRule = (replacableRule) => {
			let newState = uuidv4().substring(0, 4);

			const rulesToAdd = [
				new PushdownTransition(
					EPSILON,
					replacableRule.pop,
					replacableRule.push[replacableRule.push.length - 1],
					replacableRule.origin,
					newState
				),
				new PushdownTransition(
					EPSILON,
					EPSILON,
					replacableRule.push.substring(
						0,
						replacableRule.push.length - 1
					),
					newState,
					replacableRule.destination
				),
			];

			return { states: [newState], transitions: rulesToAdd };
		};

		while (shouldKeepBreaking) {
			const { states: newStates, transitions: rulesInStep } =
				explainRule(ruleToBreak);

			this.addStep(
				{ add: { states: newStates, transitions: rulesInStep } },
				`Se parte la regla, epsilon, ${ruleToBreak.pop} -> ${ruleToBreak.push}`
			);

			this.generateDotText();

			ruleToBreak = rulesInStep[1];

			shouldKeepBreaking = ruleToBreak.push.length > 1 || false;
		}
	}
}

// Las terminales son las terminales del estado inicial
// El lenguaje de la pila es V, + Terminales + simbolo

// Se crea el estado qi (inicial)
// se crea el estado qc
// se crea la transición qi -> qc con epsilon, epsilon, (variableIncial$)
// se crea la transicion qc -> qc con epsilon da da, para cada variable
// se crea la transicion qc -> qc con epsilon da da para cada terminal
// se crea el estado qa
// se crea la transicion qc -> qa con da da da

// Se termina el automata de pila en su forma resumida

// para cada transicion donde la longitud de push es mayor a 1:
// Retirar esa transicion
// Agregar transición a un nuevo estado que tiene de push la ultima variable
// dejar el resto como esa transicion
// Repetir
