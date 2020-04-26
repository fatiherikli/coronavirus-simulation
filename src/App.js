import React, { useEffect, useState, useRef } from "react";

import styles from "./App.module.css";
import Graph from "./Graph";
import LineChart from "./LineChart";
import SimulationSettings from "./SimulationSettings";
import { SICK, RECOVERED, DEAD } from "./constants";
import { useInterval, randomChoice } from "./utils";
import { nextSimulationTick, getInitialGraph, setMarkovChain } from "./simulation";

const INITIAL_SIMULATION_STATE = {
  tick: 0,
  agentsPerHouse: 9,
  houses: 48,
  initialSickAgents: 1,
  closedBorders: 2,
  maskWearPercentage: 0
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
            Imagine you are ruling over the European Union and can also influence how a sickness like COVID-19 behaves in a population like the European Union. What would you do if you were chief of the EU? Would you lock it down? Would you set out laws to make people wear masks? Explore your ability to manage the EU by changing the sliders above and watch how the sickness spreads over time. 😊
          </p>
          <p>
            This simulator is a direct result of the <a href="https://euvsvirus.org/">EUvsVirus</a> Hackathon 2020 based on this whitepaper: <a href="https://devpost.com/software/political-policies-effect-on-covid-19-spread-inside-the-eu-uamhdv">Political policies effect on COVID-19 spread inside the EU</a>.
          </p>
          <h1>How does it work?</h1>
          <p>
            This simulator models the spread of COVID-19 amongst the inhabitants of Europe. At the beginning of each simulation, all but a few inhabitants are healthy. The number of inhabitants that are sick at the start of the simulation can be set by adjusting the corresponding slider.
          </p>
          <p>
            Once the simulation starts, inhabitants will begin to travel around. While visiting other countries, the healthy inhabitants might get in contact with sick inhabitants and, as a result, risk getting infected with the virus. Once back home, an infected inhabitant might also infect its countries fellow inhabitants.
          </p>
          <p>
            As in the real world, once infected, an inhabitant's future can develop in two ways. The first and most bright outcome is recovery from the virus 🥳. The second, obviously unwanted outcome, is death 😢.
          </p>
          <p>
            Whether an inhabitant gets sick or if an infected inhabitant recovers or dies is based on probabilistic values.
          </p>
          <p>
            The probabilistic values are defined in a so-called <a href="https://en.wikipedia.org/wiki/Markov_chain">Markov-chain</a>. A Markov chain is a stochastic model to describe a sequence of possible events that can occur in the future.
          </p>
          <p>
            We're using a Markov graph to define a probabilistic transition. We can simply say that Markov chain is a graph of all the possible state transitions of an individual inhabitant. In our model, we have events such as getting infected, recovering from the virus, or death.
          </p>
          <h1>I would like to discover more:</h1>
          <p>
            This is an MIT-licensed open-source project, you can find the source
            code on <a href="https://github.com/eusim/coronavirus-simulation">GitHub</a>. Feel free to copy, use or modify it for your own
            simulations.
          </p>
          <p>
            Created by<br />
            <a href="https://twitter.com/fthrkl">Fatih Erikli</a><br />
            <a href="https://twitter.com/michel_mke">Michel Make</a><br />
            <a href="https://twitter.com/rscircus">Roland Siegbert</a>
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
