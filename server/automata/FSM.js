/**
 * Automata Engine - Finite State Machine (FSM) Core
 * Implements deterministic finite automaton principles for intrusion detection.
 * Formal model: M = (Q, Sigma, delta, q0, F)
 * States Q = { START, SYN_SENT, CONNECTION, FAILED, ALERT }
 */

const STATES = {
  START: 'START',
  SYN_SENT: 'SYN_SENT',
  CONNECTION: 'CONNECTION',
  FAILED: 'FAILED',
  ALERT: 'ALERT'
};

class FiniteStateMachine {
  constructor(id, rule) {
    this.id = id;
    this.rule = rule;
    this.currentState = STATES.START;
    this.history = []; // [{ from, to, symbol, timestamp, eventId }]
    this.matchedEvents = [];
    this.sequenceStep = 0;
    this.createdAt = new Date();
    this.lastUpdatedAt = new Date();
  }

  getCurrentState() {
    return this.currentState;
  }

  isAlert() {
    return this.currentState === STATES.ALERT;
  }

  getStateTrace() {
    const trace = [STATES.START];
    this.history.forEach(h => trace.push(h.to));
    return trace;
  }

  /**
   * Evaluates input symbol against the specific rule transition table
   * @param {string} symbol - Action from log (SYN, LOGIN_FAIL, etc.)
   * @param {object} event - Raw network event object
   * @returns {boolean} - true if transition reached ALERT
   */
  processSymbol(symbol, event) {
    this.lastUpdatedAt = new Date(event.timestamp || Date.now());
    const normalizedSymbol = (symbol || '').toUpperCase().trim();
    const fromState = this.currentState;

    const transitionResult = this.rule.evaluate(
      this.currentState,
      normalizedSymbol,
      this.sequenceStep,
      event
    );

    if (transitionResult.matched) {
      this.currentState = transitionResult.nextState;
      this.sequenceStep = transitionResult.nextStep;
      this.matchedEvents.push(event);

      this.history.push({
        from: fromState,
        to: this.currentState,
        symbol: normalizedSymbol,
        timestamp: event.timestamp || new Date().toISOString(),
        eventId: event.id || event._id
      });

      if (this.currentState === STATES.ALERT) {
        return true;
      }
    } else if (transitionResult.reset) {
      // Non-matching packet resets sequence back to START if configured
      this.reset();
    }

    return false;
  }

  reset() {
    this.currentState = STATES.START;
    this.sequenceStep = 0;
    this.matchedEvents = [];
    this.history = [];
  }
}

module.exports = {
  STATES,
  FiniteStateMachine
};
