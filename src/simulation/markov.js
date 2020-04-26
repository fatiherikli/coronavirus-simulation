import {
  SUSCEPTIBLE, SICK, RECOVERED, DEAD,
} from '../constants';

import { randomChoice, weightedRandom } from '../utils';

export const STAY = 'stay';
export const BASE = 'base';

const SIR_TRANSITION_STATE = {
  [SUSCEPTIBLE]: [
    [1, SUSCEPTIBLE],
  ],
  [RECOVERED]: [
    [1, RECOVERED],
  ],
  [SICK]: [
    [0.995, SICK],
    [0.004, RECOVERED],
    [0.001, DEAD],
  ],
  [DEAD]: [
    [1, DEAD],
  ],
};

const DISEASE_SPREAD_TRANSITION = {
  [SUSCEPTIBLE]: [
    [0.3, SICK],
    [0.7, SUSCEPTIBLE],
  ],
  [RECOVERED]: [
    [1, RECOVERED],
  ],
  [SICK]: [
    [1, SICK],
  ],
  [DEAD]: [
    [1, DEAD],
  ],
};

export function getNextMarkovStateForAgent(agent, transitionMap) {
  const [agentLocation] = agent.location.split('-');

  // TODO: traveliness will be implemented here
  if (agentLocation === 'house' && Math.random() < 0.9) {
    return STAY;
  }

  const map = transitionMap[agentLocation];

  return randomChoice(map);
}

export function applySIRModel(nodes, edges) {
  for (const node of nodes) {
    if (node.type !== 'agent') {
      continue;
    }

    const location = nodes.find(({ id }) => node.location === id);
    const fellows = edges
      .filter(({ target }) => target.id === location.id)
      .map(({ source }) => source);

    fellows.forEach(
      (fellow) => {
        if (fellow.id === node.id) {
          return;
        }

        if (node.state === SICK) {
          fellow.state = weightedRandom(DISEASE_SPREAD_TRANSITION[fellow.state]);
        }

        fellow.state = weightedRandom(SIR_TRANSITION_STATE[fellow.state]);
      }
    )
  }
}
