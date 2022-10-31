import React from "react";
// events
import { decrease } from "./store/events/decrease.event";
import { increase } from "./store/events/increase.event";
// store
import { useState } from "./store/store";
// styles
import "./App.css";

const Value = () => {
  const [value] = useState("value");
  return <h3>{value}</h3>;
};

export function App() {
  return (
    <div>
      <h1>emstore</h1>
      <button onClick={decrease}>-</button>
      <Value />
      <button onClick={increase}>+</button>
    </div>
  );
}
