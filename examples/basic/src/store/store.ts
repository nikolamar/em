import { createStore } from "emstore";

export const { Provider, useState, eventState } = createStore(
  { value: 0 },
  { consoleLog: true, persist: true }
);
