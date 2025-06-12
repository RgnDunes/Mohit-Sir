
import './App.css';
import Button from './components/Button';
import {useEffect, useState} from 'react';
import {buttonhandler, getAddition, getSubtraction} from './service/fetchData.js';

export default function App() {
  const [added, setAdded] = useState(0);
  const [subtracted, setSubtracted] = useState(0);
  const [buttonLabel, setButtonLabel] = useState("Click me");

  async function buttonClick(){
    const buttonLabel = await buttonhandler();
    setButtonLabel(buttonLabel);
  }

  async function addNumbers() {
    const input1 = document.querySelector('input[placeholder="input 1"]').value;
    const input2 = document.querySelector('input[placeholder="input 2"]').value;
    const response = await getAddition(input1, input2);
    setAdded(response.sum);
  }

  async function subtractNumbers() {
    const input1 = document.querySelector('input[placeholder="input 3"]').value;
    const input2 = document.querySelector('input[placeholder="input 4"]').value;
    const response = await getSubtraction(input1, input2);
    setSubtracted(response.diff);
  }


  useEffect(() => {
    console.log("Component mounted or updated");
  }, []);

  return (
    <div>
    <div className="App">
      <h1>Hello World</h1>
      <Button label={buttonLabel} onClick={buttonClick} />
    </div>
    <div className="content">
      <input type="text" placeholder="input 1" />
      <input type="text" placeholder="input 2" />
      <button label= "Add" onClick={addNumbers}>Add</button>
      <input type="text" value={added} />
    </div>
    <div className="content">
      <input type="text" placeholder="input 3" />
      <input type="text" placeholder="input 4" />
      <button label= "Subtract" onClick={subtractNumbers}>Subtract</button>
      <input type="text" value={subtracted} />
    </div>
    </div>
  );
}


