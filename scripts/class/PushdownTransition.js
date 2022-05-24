export class PushdownTransition {
	constructor(read, pop, push, origin, destination) {
		this.read = read;
		this.pop = pop;
		this.push = push;
this.origin = origin
this.destination = destination
	}

	equals(read, pop, push, origin, destination) {
		if (read instanceof PushdownTransition) {
			return (
				read.read === this.read &&
				read.pop === this.pop &&
				read.push === this.push &&
read.origin === this.origin &&
read.destination === this.destination
			);
		}

		return read === this.read && pop === this.pop && push === this.push && origin === this.origin && destination === this.destination;
	}

	validTransitionFor(automata) {

		const isValidRead = automata.terminals.has(this.read);

		const isValidForStack =
			this.pop
				.split("")
				.reduce(
					(prev, curr) => prev && automata.stackTerms.has(curr),
					true
				) &&
			this.push
				.split("")
				.reduce(
					(prev, curr) => prev && automata.stackTerms.has(curr),
					true
				);

		const hasValidStates = [this.origin, this.destination].reduce((prev, curr) => prev && automata.states.has(curr), true)

		return isValidForStack && isValidRead && hasValidStates;
	}
}
