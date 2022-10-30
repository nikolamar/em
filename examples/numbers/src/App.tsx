import React from "react";
import { Provider, states } from "./store/store";
import { increment } from "./store/events/increment.event";
import { IntervalSlider } from "./components/IntervalSlider";
import { Container } from "./components/Container";
import { Value } from "./components/Value";
import "./App.css";

export function App() {
  React.useEffect(() => {
    const clearInterval = increment();
    return clearInterval;
  }, []);

  return (
    <Provider>
      <IntervalSlider />
      <Container>
        {Object.keys(states).map((key: string) => (
          <Value key={key} stateKey={key} />
        ))}
      </Container>
    </Provider>
  );
}
