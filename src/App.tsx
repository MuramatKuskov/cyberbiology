import { useEffect, useState } from 'react';
import './App.css';
import DesignationsComponent from './components/DesignationsComponent';
import FieldComponent from './components/FieldComponent';
import InputsComponent from './components/InputsComponent';
import { Being } from './models/Being';
import { Field } from './models/Field';

function App() {
  const [field, setField] = useState(new Field(50, 30));
  const [worldAge, setWorldAge] = useState(0);
  const [iteration, setIteration] = useState(0);
  const [numBots, setNumBots] = useState(field.bots.length);
  const [elderPopulations, setElderPopulations] = useState([0]);
  const [survivors, setSurvivors] = useState<Being[]>([]);
  // input parameters
  const [mapWidth, setMapWidth] = useState(50);
  const [mapHeight, setMapHeight] = useState(30);
  const [fastMode, setFastMode] = useState(false);
  const [initialPopulation, setInitPopulation] = useState(65);
  const [waterLevel, setWatelLevel] = useState(0.1);
  const [foodLevel, setFoodLevel] = useState(0.2);
  const [poisonLevel, setPoisonLevel] = useState(0.1);


  useEffect(() => {
    restart();
    setFastMode(true);
  }, [])

  useEffect(() => {
    if (numBots < 1) {
      restart();
      setIteration(iteration + 1);
      setFastMode(true);
    }
    if (numBots < 6) setSurvivors(field.bots.longestSurvivors);
  }, [numBots])

  useEffect(() => {
    const interval = field.startSimulation(fastMode);
    return () => { clearInterval(interval) }
  }, [fastMode, field])

  useEffect(() => {
    const generationObserver = setInterval(updWorldAge, 500);
    const botLengthObserver = setInterval(updNumBots, 300);
    const elderObserver = setInterval(updElderPopulations, 500);
    return () => {
      clearInterval(generationObserver);
      clearInterval(botLengthObserver);
      clearInterval(elderObserver);
    }
  }, [field])

  function updWorldAge() {
    setWorldAge(field.age);
  }

  function updNumBots() {
    setNumBots(field.bots.length);
  }

  function updElderPopulations() {
    const eldPop = field.bots.list.map((el: any) => el = el.lastMutation).sort((a: number, b: number) => a + b).slice(0, 5);
    setElderPopulations(eldPop);
  }

  function restart() {
    const newField = new Field(mapWidth, mapHeight);
    newField.initCells(waterLevel, foodLevel, poisonLevel);
    newField.spawnBots(initialPopulation, survivors);
    setField(newField);
  }

  return (
    <div className='app'>
      <InputsComponent
        fastMode={fastMode}
        setFastMode={setFastMode}
        initialPopulation={initialPopulation}
        setInitPopulation={setInitPopulation}
        mapWidth={mapWidth}
        setMapWidth={setMapWidth}
        mapHeight={mapHeight}
        setMapHeight={setMapHeight}
        waterLevel={waterLevel}
        setWaterLevel={setWatelLevel}
        foodLevel={foodLevel}
        setFoodLevel={setFoodLevel}
        poisonLevel={poisonLevel}
        setPoisonLevel={setPoisonLevel}
        restart={restart}
      />
      <FieldComponent cells={field.cells} />
      <DesignationsComponent worldAge={worldAge} iteration={iteration} numBots={numBots} elderPopulations={elderPopulations} />
    </div>
  );
}

export default App;
