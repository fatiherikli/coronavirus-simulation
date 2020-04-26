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
        Initial sick inhabitants<br />
        <input
          type={ 'range' }
          onChange={ onSettingChange('initialSickAgents') }
          value={ simulationState.initialSickAgents }
          min={ 0 }
          max={ 10 }
        /> <span className={ styles.value }>{ simulationState.initialSickAgents }</span>
      </label>
      <label>
        Inhabitants per country <br />
        <input
          type={ 'range' }
          onChange={ onSettingChange('agentsPerHouse') }
          value={ simulationState.agentsPerHouse }
          min={ 1 }
          max={ 10 }
        /> <span className={ styles.value }>{ simulationState.agentsPerHouse }</span>
      </label>
      <label>
        Are the borders closed? <br />
        <input
            type={'range'}
            onChange={onSettingChange('closedBorders')}
            value={simulationState.closedBorders}
            min={0}
            max={2}
          /><br /> 0: closed, 1: some open<br />2: all open
      </label>
      <label>
        What percentage of citizens wears masks <br />
        <input
          type={ 'range' }
          onChange={ onSettingChange('maskWearPercentage') }
          value={ simulationState.maskWearPercentage }
          min={ 0 }
          max={ 100 }
        /> <span className={ styles.value }>{ simulationState.maskWearPercentage } %</span><br /><i>this one works in realtime</i>
      </label>
      </div>

      <div className={ styles.footer }>
        <button onClick={ onRestartButtonClick }>Restart the simulation</button>
      </div>
    </div>
  );
}
