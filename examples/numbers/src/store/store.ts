import { createStore } from "emstore";

export const states: Record<string, number> = { interval: 0 };

// { counter: 0, counter: 1, counter: 2, ... counter: 79, interval: 0 }
for (let i = 0; i < 119; i++) {
  states[`counter${i}`] = 0;
}

export const { Provider, useState, eventState } = createStore(states, {
  consoleLog: true,
  persist: true,
});
