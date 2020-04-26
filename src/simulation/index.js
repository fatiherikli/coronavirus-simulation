import { randomSample, distance } from '../utils';

import { AGENT, SUSCEPTIBLE, SICK, DEAD } from '../constants';

import { getNextMarkovStateForAgent, STAY, BASE, applySIRModel } from './markov';
import { applyFixedNodeGrid } from './grid';

const VENUES = [
  {
    name: 'house',
    members: simulationState => simulationState.agentsPerHouse,
    isRoot: true,
    count: simulationState => simulationState.houses,
  }
];

const VENUE_TRANSITIONS = {
  'house': [BASE, BASE, BASE, 'NL', BASE, BASE, BASE, BASE],
};

function getInitialGraph(simulationState) {
  const nodes = [];
  const edges = [];

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


  nodes = applySIRModel(nodes, edges);

  return {
    nodes: nodes,
    edges: edges,
    state: { ...state, tick: state.tick + 1},
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
  const closest = targets.reduce(
    (prev, current) => distance(source, current) < distance(source, prev) ? current : prev
  );

  return closest;
}

export {
  VENUES,
  VENUE_TRANSITIONS,
  getInitialGraph,
  nextSimulationTick,
};
