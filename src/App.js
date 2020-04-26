import React, { useEffect, useState, useRef } from "react";

import styles from "./App.module.css";
import Graph from "./Graph";
import LineChart from "./LineChart";
import SimulationSettings from "./SimulationSettings";
import { SICK, RECOVERED, DEAD } from "./constants";
import { useInterval, randomChoice } from "./utils";
import { nextSimulationTick, getInitialGraph } from "./simulation";

const INITIAL_SIMULATION_STATE = {
  tick: 0,
  agentsPerHouse: 9,
  houses: 48,
  initialSickAgents: 1,
};

// Setup initial graph containing venues and agents
const INITIAL_GRAPH = getInitialGraph(INITIAL_SIMULATION_STATE);

function App() {
  const [simulationState, setSimulationState] = useState(
    INITIAL_SIMULATION_STATE
  );
  const [nodes, setNodes] = useState(INITIAL_GRAPH.nodes);
  const [edges, setEdges] = useState(INITIAL_GRAPH.edges);
  const [historicalSickCount, setHistoricalSickCount] = useState([]);
  const [historicalRecoveredCount, setHistoricalRecoveredCount] = useState([]);
  const [historicalDeadCount, setHistoricalDeadCount] = useState([]);
  const [loading, setLoading] = useState(true);

  const graphRef = useRef(null);

  useInterval(() => {
    if (loading) {
      return;
    }

    const { nodes: _nodes, edges: _edges, state } = nextSimulationTick(
      simulationState,
      nodes,
      edges
    );

    setSimulationState(state);

    // Setup for graph in the bottom right
    setHistoricalSickCount(
      historicalSickCount.concat(
        nodes.filter(({ state }) => state === SICK).length
      )
    );

    setHistoricalRecoveredCount(
      historicalRecoveredCount.concat(
        nodes.filter(({ state }) => state === RECOVERED).length
      )
    );

    setHistoricalDeadCount(
      historicalDeadCount.concat(
        nodes.filter(({ state }) => state === DEAD).length
      )
    );
  }, 1000);

  useEffect(() => {
    setLoading(false);
  }, [loading]);


  // Quarantine
  const onNodeClick = (nodeId) => {
    return () => {
      const node = nodes.find(({ id }) => nodeId === id);
      if (node.type !== "venue") {
        return;
      }
      node.locked = !node.locked;
    };
  };

  const onSettingChange = (key) => (event) => {
    setSimulationState({ ...simulationState, [key]: event.target.value });
  };

  const onRestartButtonClick = () => {
    const { nodes, edges } = getInitialGraph(simulationState);
    setLoading(true);
    setNodes(nodes);
    setEdges(edges);
    setHistoricalDeadCount([]);
    setHistoricalRecoveredCount([]);
    setHistoricalSickCount([]);
    setSimulationState({ ...simulationState, tick: 0 });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>What happens in Europe if we ... ?</h3>
        <h2>An experiment to analyse how a virus spreads over Europe</h2>
      </div>
      <div className={styles.simulation}>
        <div className={styles.samples}>
          <span className={styles.sampleSusceptible}>Susceptible</span>
          <span className={styles.sampleInfected}>Infected</span>
          <span className={styles.sampleRecovered}>Recovered</span>
          <span className={styles.sampleDead}>Deceased</span>
          <i>Click on a country to lock it down (quarantine)</i>
        </div>
        {!loading && (
          <Graph
            width={
              Math.round(
                nodes.filter(({ type }) => type === "venue").length / 6
              ) * 110
            }
            height={700}
            tick={simulationState.tick}
            nodes={nodes}
            edges={edges}
            onNodeClick={onNodeClick}
            ref={graphRef}
          />
        )}
      </div>
      <div className={styles.section}>
        <div className={styles.stats}>
          <h3>Stats</h3>
          <div className={styles.population}>
            POPULATION: {nodes.filter(({ type }) => type === "agent").length}{" "}
            <br />
            <span className={styles.deceased}>Dead</span>: {nodes.filter(({ state }) => state === DEAD).length} <br />
            
            <span className={styles.recovered}>Recovered</span>: {
              nodes.filter(({ state }) => state === RECOVERED).length
            }{" "}
            <br />
            <span className={styles.sick}>Sick</span>: {nodes.filter(({ state }) => state === SICK).length} <br />
          </div>
          <LineChart
            width={300}
            height={270}
            data={[
              { color: "red", points: historicalSickCount },
              { color: "green", points: historicalRecoveredCount },
              { color: "black", points: historicalDeadCount },
            ]}
          />
        </div>
        <div className={styles.simulationSettings}>
          <h3>Settings</h3>
          <div className={styles.simulationInfo}>
            Click on a country on the map to make it quarantined.
          </div>
          <SimulationSettings
            simulationState={simulationState}
            onSettingChange={onSettingChange}
            onRestartButtonClick={onRestartButtonClick}
          />
        </div>
        
      </div>
      <div className={styles.pageInfo}>
      <ins
          className="adsbygoogle"
          style={{ display: 'block', textAlign: 'center' }}
          data-ad-layout="in-article"
          data-ad-format="fluid"
          data-ad-client="ca-pub-5587173855104127"
          data-ad-slot="8487596319"
        ></ins>
        <div className={styles.section}>
          <h1>What is this?</h1>
          <p>
            This is a simulation of how a virus spread of the population. The
            simulation is heavily inspired by the SIR model. SIR is a technique
            used to simplify the mathematical modelling of infectious disase.
          </p>
          <p>
            In the SIR model, we have three different states of each agent (a
            person). The first state is
            <i> SUSCEPTIBLE</i>, second one is <i> SICK</i>, and the last one is
            <i> RECOVERED</i>. We have also a <i> DEAD</i> state in this
            simulation.
          </p>
          <h1>How does it work?</h1>
          <p>
            Every agent starts with the `SUSCEPTIBLE` state in the simulation,
            except a few of them. Some of the agents are on the `SICK` state at
            the very beginning. Over the time, sick agents spread the virus to
            rest of the population and the other agents get sick as well. After
            the infection, they switch into a recovered or a dead state based on
            some probabilistic values.
          </p>
          <p>
            The probabilistic values are defined in a markov-chain concept.
            Markov chain is a stochastic model to describe a sequence of
            possible events that can occur in the future.
          </p>
          <h1>How does a probabilistic model look like?</h1>
          <p>
            We're using a markov graph to define a probabilistic transition. We
            can simply say that markov chain is a graph of all the possible
            state transitions of an individual node.
          </p>
          <h1>I would like to discover more:</h1>
          <p>
            This is an MIT-licensed open-source project, you can find the source
            code on github. Feel free to copy, use or modify it for your own
            simulations.
          </p>
          <p>
            <a href="https://github.com/eusim/coronavirus-simulation">
              https://github.com/eusim/coronavirus-simulation
            </a> which is based on
            <a href="https://twitter.com/fthrkl">@fthrkl</a>'s
            <br />
            <a href="https://github.com/fatiherikli/coronavirus-simulation">
              https://github.com/fatiherikli/coronavirus-simulation
            </a>
          </p>

          <p style={{ marginBottom: "4em" }}>
            Stay safe! <br />{" "}
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
