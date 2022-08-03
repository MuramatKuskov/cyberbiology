import React, { useEffect, useState } from 'react';
import './App.css';
import DesignationsComponent from './components/DesignationsComponent';
import FieldComponent from './components/FieldComponent';
import InputsComponent from './components/InputsComponent';
import { Field } from './models/Field';

function App() {
  const [field, setField] = useState(new Field());
  const [fastMode, setFastMode] = useState(false);

  useEffect(() => {
    restart();
    setFastMode(true);
  }, [])

  useEffect(() => {
    const interval = field.startSimulation(fastMode);
    return () => { clearInterval(interval) }
  }, [fastMode])

  // field.bots.length не обновляется, новый стейт и коллбек в BotList?
  useEffect(() => {
    console.log(field.bots.length);

  }, [field.bots.length])

  function restart() {
    const newField = new Field();
    newField.initCells();
    newField.spawnBots(55);
    setField(newField);
  }

  return (
    <div className='app'>
      <InputsComponent fastMode={fastMode} setFastMode={setFastMode} />
      <FieldComponent cells={field.cells} />
      <DesignationsComponent field={field} />
    </div>
  );
}

export default App;
