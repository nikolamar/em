import React from "react";
import { createStore } from "emstore";
import Slider from "react-smooth-range-input";
import "./App.css";

// { counter: 0, counter: 1, counter: 2, ... counter: 79 }
const states: Record<string, number> = { interval: 0 };
for (let i = 0; i < 119; i++) {
  states[`counter${i}`] = 0;
}

// create store and log state changes
const { Provider, useState, eventState } = createStore(states, {
  consoleLog: true,
});

// add event state and name it "increment"
const state = eventState("increment");

// create "handleSlider" event
const handleSlider = (value: number) => {
  const [, setInterval] = state("interval");
  setInterval(() => value);
  counter();
};

// create counters that increment
let timeout: any;
const counter = () => {
  const [interval] = state("interval");
  clearInterval(timeout);
  timeout = setInterval(() => {
    const key = `counter${Math.floor(Math.random() * 120)}`;
    const [, setCounter] = state(key);
    setCounter((num: number) => {
      if (num === 100) {
        return 0;
      }
      return num + 1;
    });
  }, interval);
};

// use hook "useState" to get state
const IntevalSlider = () => {
  const [interval] = useState("interval");
  return <Slider value={interval} min={0} max={100} onChange={handleSlider} />;
};

// use hook "useState" to get state
const Number = ({ stateKey }: { stateKey: string }) => {
  const [count] = useState(stateKey);
  return <h5>{count}</h5>;
};

const Container: React.FC<any> = ({ children }) => {
  return <div className="container">{children}</div>;
};

export function App() {
  React.useEffect(counter, []);
  return (
    <Provider>
      <IntevalSlider />
      <Container>
        {Object.keys(states).map((key: string) => (
          <Number key={key} stateKey={key} />
        ))}
      </Container>
    </Provider>
  );
}
