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
  houses: 42,
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
        <a href="/" style={{ color: 'gray', textDecoration: 'none' }}>↵ Other simulations</a>
        <h3>Simulating coronavirus with the SIR model</h3>
        <h2>An experiment to analyse how a virus spread over a community</h2>
      </div>
      <div className={styles.simulation}>
        <div className={styles.samples}>
          <span className={styles.sampleSusceptible}>Susceptible</span>
          <span className={styles.sampleInfected}>Infected</span>
          <span className={styles.sampleRecovered}>Recovered</span>
          <i>Click on a building to lock it (quarantine)</i>
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
            DEAD: {nodes.filter(({ state }) => state === DEAD).length} <br />
            RECOVERED: {
              nodes.filter(({ state }) => state === RECOVERED).length
            }{" "}
            <br />
            SICK: {nodes.filter(({ state }) => state === SICK).length} <br />
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
            Click on a building on the map to make it quarantined.
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
          <div style={{ height: 600 }}>
            <iframe
              style={{
                position: "absolute",
                border: 0,
                marginLeft: "-4em",
              }}
              width={970}
              height={650}
              src={
                "https://fatiherikli.github.io/markov-chain-demo/index-en.html"
              }
            />
          </div>
          <p>
            In a infectious disaese case, we can use markov chains to define the
            probabilistic chain of an person to be inftected, to be recovered,
            or to be dead. Furthermore, we can also define the possible travel
            route of an agent by using the same technique.
          </p>
          <h1>
            How can we define a probabilistic model of an infecitious disease?
          </h1>
          <p>
            As I previously mentioned, we can use the SIR model to set up the
            simulation, and we can use markov chains to define probabilistic
            model of an infectious disaese.
          </p>
          <p style={{ fontWeight: "bold" }}>
            I would like to give a disclaimer that, I'm just an open-source
            developer who loves building data visualizations and simulations, I
            don't have a background of Epidemiology or other related stuff.
            Please don't take my assumptions seriously.
          </p>
          <p>Here's the state transition map of an agent over the time.</p>
          <pre>{`const SIR_TRANSITION_STATE = {
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
};`}</pre>
          <p>
            Simulation's clock ticks on each second. On each tick, all the
            agents are subject to that transition map. As you can see on that
            object, we have defined states as keys, and possible values of that
            specific state. For example, a SUSCEPTIBLE person will be always
            SUSCEPTIBLE, there's no any state change for that state, yet. But
            for a sick agent, there are two more possible states different than
            it's actual state. So the options are; staying as sick until the
            next state transition, being recovered, or being dead. The values
            defined before the next state is the probabilistic value.
          </p>
          <pre>{`const DISEASE_SPREAD_TRANSITION = {
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
};`}</pre>
          <p>
            The previous transition map was for a person who has no any
            interaction with a sick person. When an agent meets with a sick
            person, the possibility of getting sick is different. As you can see
            on this map, a susceptible person will get sick by the possibility
            of %30.
          </p>
          <p>
            Question: In that map, people who already recovered from the virus
            develop an immunity and don't get sick again. How could we define
            the probabilistic map if the disease was super infectious and people
            who recovered don't gain any immunity?
          </p>
          <h2>Other simulations</h2>
          <p>
            If you liked that stuff, you can explore other simulations that I
            created in the past.
          </p>
          <ul>
            <li>
              <a href="https://fatiherikli.github.io/post-truth/">
                Post-truth: How a disinformation spreads over a community
              </a>
            </li>
            <li>
              <a href="https://fatiherikli.github.io/language-evolution-simulation/">
                Language-evolution: Simulation of the evolution of languages
              </a>
            </li>
            <li>
              <a href="https://fatiherikli.github.io/crowd-simulation/">
                Crowd-of-istanbul: Crowd simulation of Istanbul streets
              </a>
            </li>
          </ul>
          <br />

          <h1>I would like to discover more</h1>
          <p>
            This is an MIT-licensed open-source project, you can find the source
            code on github. Feel free to copy, use or modify it for your own
            simulations.
          </p>
          <p>
            <a href="https://github.com/fatiherikli/coronavirus-simulation">
              https://github.com/fatiherikli/coronavirus-simulation
            </a>
          </p>

          <p style={{ marginBottom: "4em" }}>
            Thanks for reading this article, and stay safe! <br />{" "}
            <a href="https://twitter.com/fthrkl">@fthrkl</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
