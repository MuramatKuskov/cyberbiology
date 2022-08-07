import React, { useEffect, useState } from 'react';
import './App.css';
import DesignationsComponent from './components/DesignationsComponent';
import FieldComponent from './components/FieldComponent';
import InputsComponent from './components/InputsComponent';
import { Field } from './models/Field';

function App() {
  const [field, setField] = useState(new Field());
  const [fastMode, setFastMode] = useState(false);
  const [generation, setGeneration] = useState(0);
  const [numBots, setNumBots] = useState(field.bots.length);

  useEffect(() => {
    restart();
    setFastMode(true);
  }, [])

  useEffect(() => {
    if (numBots < 1) {
      restart();
      setFastMode(true);
    }
  }, [numBots])

  useEffect(() => {
    const interval = field.startSimulation(fastMode);
    return () => { clearInterval(interval) }
  }, [fastMode, field])

  useEffect(() => {
    const generationObserver = setInterval(updGeneration, 500);
    const botLengthObserver = setInterval(updNumBots, 300);
    return () => {
      clearInterval(generationObserver);
      clearInterval(botLengthObserver);
    }
  }, [field])

  function updGeneration() {
    setGeneration(field.generation);
  }

  function updNumBots() {
    setNumBots(field.bots.length);
  }

  function restart() {
    const newField = new Field();
    newField.initCells();
    newField.spawnBots(55);
    setField(newField);
  }

  return (
    <div className='app'>
      <InputsComponent
        fastMode={fastMode}
        setFastMode={setFastMode}
        restart={restart}
      />
      <FieldComponent cells={field.cells} />
      <DesignationsComponent generation={generation} />
    </div>
  );
}

export default App;
