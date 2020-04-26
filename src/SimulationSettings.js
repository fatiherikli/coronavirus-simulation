import React from 'react';

import styles from './SimulationSettings.module.css';

export default function SimulationSettings({
  simulationState,
  onSettingChange,
  onRestartButtonClick,
}) {
  return (
    <div className={ styles.container }>
      <div className={ styles.form }>
      <label>
        Initial sick agents<br />
        <input
          type={ 'range' }
          onChange={ onSettingChange('initialSickAgents') }
          value={ simulationState.initialSickAgents }
          min={ 0 }
          max={ 10 }
        /> <span className={ styles.value }>{ simulationState.initialSickAgents }</span>
      </label>
      <label>
        Agents per building <br />
        <input
          type={ 'range' }
          onChange={ onSettingChange('agentsPerHouse') }
          value={ simulationState.agentsPerHouse }
          min={ 1 }
          max={ 10 }
        /> <span className={ styles.value }>{ simulationState.agentsPerHouse }</span>
      </label>
      </div>

      <div className={ styles.footer }>
        <button onClick={ onRestartButtonClick }>Restart the simulation</button>
      </div>
    </div>
  );
}
