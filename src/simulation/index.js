import { randomSample, distance } from '../utils';

import { AGENT, SUSCEPTIBLE, SICK, RECOVERED, DEAD } from '../constants';

import { getNextMarkovStateForAgent, STAY, BASE, applySIRModel, DISEASE_SPREAD_TRANSITION } from './markov';
import { applyFixedNodeGrid } from './grid';

const VENUES = [
  {
    name: 'house',
    members: simulationState => simulationState.agentsPerHouse,
    isRoot: true,
    count: simulationState => simulationState.houses,
  }
];

const REGULAR_VENUE_TRANSITIONS = {
  'house': [BASE, BASE, BASE, 'NL', BASE, BASE, BASE, BASE,
    BASE, BASE, BASE, "AL", BASE, BASE, BASE,
    BASE, BASE, BASE, "AX", BASE, BASE, BASE,
    BASE, BASE, BASE, "AD", BASE, BASE, BASE,
    BASE, BASE, BASE, "AT", BASE, BASE, BASE,
    BASE, BASE, BASE, "BE", BASE, BASE, BASE,
    BASE, BASE, BASE, "BG", BASE, BASE, BASE,
    BASE, BASE, BASE, "BA", BASE, BASE, BASE,
    BASE, BASE, BASE, "BY", BASE, BASE, BASE,
    BASE, BASE, BASE, "CH", BASE, BASE, BASE,
    BASE, BASE, BASE, "CZ", BASE, BASE, BASE,
    BASE, BASE, BASE, "DE", BASE, BASE, BASE,
    BASE, BASE, BASE, "DK", BASE, BASE, BASE,
    BASE, BASE, BASE, "ES", BASE, BASE, BASE,
    BASE, BASE, BASE, "EE", BASE, BASE, BASE,
    BASE, BASE, BASE, "FI", BASE, BASE, BASE,
    BASE, BASE, BASE, "FR", BASE, BASE, BASE,
    BASE, BASE, BASE, "GB", BASE, BASE, BASE,
    BASE, BASE, BASE, "GG", BASE, BASE, BASE,
    BASE, BASE, BASE, "GR", BASE, BASE, BASE,
    BASE, BASE, BASE, "HR", BASE, BASE, BASE,
    BASE, BASE, BASE, "HU", BASE, BASE, BASE,
    BASE, BASE, BASE, "IM", BASE, BASE, BASE,
    BASE, BASE, BASE, "IE", BASE, BASE, BASE,
    BASE, BASE, BASE, "IS", BASE, BASE, BASE,
    BASE, BASE, BASE, "IT", BASE, BASE, BASE,
    BASE, BASE, BASE, "JE", BASE, BASE, BASE,
    BASE, BASE, BASE, "XK", BASE, BASE, BASE,
    BASE, BASE, BASE, "LI", BASE, BASE, BASE,
    BASE, BASE, BASE, "LT", BASE, BASE, BASE,
    BASE, BASE, BASE, "LU", BASE, BASE, BASE,
    BASE, BASE, BASE, "LV", BASE, BASE, BASE,
    BASE, BASE, BASE, "MC", BASE, BASE, BASE,
    BASE, BASE, BASE, "MD", BASE, BASE, BASE,
    BASE, BASE, BASE, "MK", BASE, BASE, BASE,
    BASE, BASE, BASE, "MT", BASE, BASE, BASE,
    BASE, BASE, BASE, "ME", BASE, BASE, BASE,
    BASE, BASE, BASE, "NL", BASE, BASE, BASE,
    BASE, BASE, BASE, "NO", BASE, BASE, BASE,
    BASE, BASE, BASE, "PL", BASE, BASE, BASE,
    BASE, BASE, BASE, "PT", BASE, BASE, BASE,
    BASE, BASE, BASE, "RO", BASE, BASE, BASE,
    BASE, BASE, BASE, "SM", BASE, BASE, BASE,
    BASE, BASE, BASE, "RS", BASE, BASE, BASE,
    BASE, BASE, BASE, "SK", BASE, BASE, BASE,
    BASE, BASE, BASE, "SI", BASE, BASE, BASE,
    BASE, BASE, BASE, "SE", BASE, BASE, BASE,
    BASE, BASE, BASE, "UA", BASE, BASE, BASE,
    BASE, BASE, BASE, "VA", BASE, BASE, BASE]
};

const HALF_ASSED_VENUE_TRANSITIONS = {
  'house': [BASE, BASE, BASE, 'NL', BASE, BASE, BASE, BASE,
    BASE, BASE, BASE, "BE", BASE, BASE, BASE,
    BASE, BASE, BASE, "DE", BASE, BASE, BASE,
    BASE, BASE, BASE, "FR", BASE, BASE, BASE,
    BASE, BASE, BASE, "GB", BASE, BASE, BASE,
    BASE, BASE, BASE, "IT", BASE, BASE, BASE,
    BASE, BASE, BASE, "PL", BASE, BASE, BASE,
    BASE, BASE, BASE, "RO", BASE, BASE, BASE,
    BASE, BASE, BASE, "SE", BASE, BASE, BASE]
};

const CLOSED_BORDER_VENUE_TRANSITIONS = {
  'house': [BASE]
};

var VENUE_TRANSITIONS = REGULAR_VENUE_TRANSITIONS;

function getInitialGraph(simulationState) {
  const nodes = [];
  const edges = [];

  if (simulationState.closedBorders == 2) {
    VENUE_TRANSITIONS = REGULAR_VENUE_TRANSITIONS;
  } else if (simulationState.closedBorders == 1) {
    VENUE_TRANSITIONS = HALF_ASSED_VENUE_TRANSITIONS;
  } else {

    VENUE_TRANSITIONS = CLOSED_BORDER_VENUE_TRANSITIONS;
  }

  VENUES.forEach(({
    name,
    members,
    isRoot,
    count,
    alignment,
  }) => {
    for (let i = 0, nodeIndex = 0; i < count(simulationState); i++, nodeIndex++) {
      const venueId = `${name}-${i}`;
      const venueIndex = nodeIndex;
      nodes.push({
        type: 'venue',
        venue: name,
        id: venueId,
        size: 1,
      });

      if (!members) {
        continue;
      }

      for (var j = 0; j < members(simulationState); j++, nodeIndex++) {
        const agentId = `${name}-${i}-${j}`;
        nodes.push({
          type: 'agent',
          location: venueId,
          base: venueId,
          id: agentId,
          size: 1,
          state: SUSCEPTIBLE,
        });
        edges.push({
          'source': agentId,
          'target': venueId,
        });
      }
    }
  });

  const sickAgents = randomSample(
    nodes.filter(({ type }) => type === 'agent'),
    simulationState.initialSickAgents
  );

  for (const agent of sickAgents) {
    agent.state = SICK;
  }

  return ({
    nodes: applyFixedNodeGrid(nodes),
    edges,
  });
}

function nextSimulationTick(state, nodes, edges) {
  const rootVenue = VENUES.find(({ isRoot }) => isRoot);

  nodes
    .filter(
      ({ type }) => type === AGENT
    )
    .forEach(
      (agent, i) => {

        const nextMarkovState = getNextMarkovStateForAgent(agent, VENUE_TRANSITIONS);
        const [agentLocation] = agent.location.split('-')

        if (
          agentLocation === nextMarkovState ||
          (nextMarkovState === BASE && agent.location === agent.base) ||
          nextMarkovState === STAY
        ) {
          return;
        } else if (agent.state === DEAD) {
          return;
        } else if (nextMarkovState === BASE) {
          moveAgent(
            nodes,
            edges,
            agent,
            nodes.find(({ id }) => id === agent.base)
          );
        } else {
          moveAgent(
            nodes,
            edges,
            agent,
            findClosestNode(agent, nodes.filter(({ venue }) => venue === nextMarkovState))
          );
        };

      }
    );


  nodes = applySIRModel(state, nodes, edges);

  return {
    nodes: nodes,
    edges: edges,
    state: { ...state, tick: state.tick + 1 },
  }
}

function moveAgent(nodes, edges, agent, targetNode) {
  const sourceNode = nodes.find(({ id }) => id === agent.location);

  if (targetNode.locked || sourceNode.locked) {
    return;
  }

  const newEdges = edges.map((edge) => {
    if (edge.source.id === agent.id) {
      edge.target = targetNode;
    }
  });

  agent.location = targetNode.id;
}

function findClosestNode(source, targets) {
  if (targets) {
    const closest = targets.reduce(
      (prev, current) => distance(source, current) < distance(source, prev) ? current : prev
    );
    return closest;
  } else {
    return source;
  }

}

export {
  VENUES,
  VENUE_TRANSITIONS,
  HALF_ASSED_VENUE_TRANSITIONS,
  REGULAR_VENUE_TRANSITIONS,
  getInitialGraph,
  nextSimulationTick
};
