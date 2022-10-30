import React from "react";
import produce, { enableMapSet } from "immer";
// types
import type { EMStoreProps, Producer } from "./types";

// constants
const PREFIX = "EMStore";

/**
 * Creates a new store and returns a react provider and a hook function and an event state function
 * @param {object} key - object with multiple states
 * @param {object} options - object to configure the store
 */
export function createStore<T>(states: T, props: EMStoreProps = null) {
  if (props?.enableMapAndSet) {
    enableMapSet();
  }

  if (props?.persist) {
    if (typeof props?.handleLocalStorageDataLoad === "function") {
      props.handleLocalStorageDataLoad(states as Record<string, any>);
    } else {
      loadStatesFromLocalStorage(states as Record<string, any>);
    }
  }

  const subscribers = new Set<() => void>();

  const subscribe = (callback: () => void) => {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
  };

  const context = React.createContext(states);

  function Provider({ children }: { children: React.ReactNode }) {
    return React.createElement(context.Provider, { value: states }, children);
  }

  const set = <K extends keyof T>(
    key: K,
    producer: Producer,
    event: string
  ) => {
    const prevState = states[key];
    const nextState = produce(prevState, producer);

    if (props?.consoleLog) {
      consoleLogChanges(key as string, event, prevState, nextState);
    }

    if (props?.persist) {
      if (typeof props?.handleLocalStorageDataSave === "function") {
        props.handleLocalStorageDataSave(key as string, prevState, nextState);
      } else {
        saveStateToLocalStorage(key as string, nextState);
      }
    }

    states[key] = nextState;

    if (typeof props?.onSetState === "function") {
      props.onSetState(key as string, prevState, nextState);
    }

    subscribers.forEach((callback) => callback());
  };

  const state = <K extends keyof T>(
    key: K,
    event = "event"
  ): [T[K], Producer] => {
    return [states[key], (producer: Producer) => set(key, producer, event)];
  };

  const eventState =
    (event: string) =>
    <K extends keyof T>(key: K) =>
      state(key, event);

  const useState = <K extends keyof T>(key: K): [T[K], Producer] => {
    React.useSyncExternalStore(subscribe, () => states[key]);
    return state(key);
  };

  return { Provider, useState, eventState };
}

/**
 * Save state to local storage
 * @param {string} key - object key of state
 * @param {*} nextState - next state value to be console logged
 */
function saveStateToLocalStorage(key: string, nextState: any) {
  try {
    localStorage.setItem(`${PREFIX}.${key}`, JSON.stringify(nextState));
  } catch (e) {
    console.log("writing local storage error", e);
  }
}

/**
 * Load state from local storage
 */
function loadStatesFromLocalStorage(states: Record<string, any>) {
  try {
    Object.keys(localStorage).forEach((localStorageKey: string) => {
      if (localStorageKey.includes(PREFIX)) {
        // parse state
        const json: any = localStorage.getItem(localStorageKey);
        const parsedState: any = JSON.parse(json);

        // cleanup prefix EMStore
        const stateKey: any = localStorageKey.replace(`${PREFIX}.`, "");

        // update states object
        Object.keys(states).forEach((stateKeyInStates: string) => {
          if (stateKeyInStates === stateKey) {
            states[stateKeyInStates] = parsedState;
          }
        });
      }
    });
  } catch (e) {
    console.log("loading local storage error", e);
  }
}

/**
 * Handle different types of state values and return a string
 * @param {*} nextState - nest state value to be console logged
 */
function handleValue(nextState: any) {
  if (typeof nextState === "string" && nextState !== "")
    return `"${nextState}"`;
  else if (nextState === "") return `""`;
  else if (typeof nextState === "boolean") return nextState;
  else if (nextState === null) return null;
  else if (nextState === undefined) return undefined;
  else if (typeof nextState === "object" && nextState?.get)
    return JSON.stringify(Object.fromEntries(nextState), null, 2);
  else if (typeof nextState === "object")
    return JSON.stringify(nextState, null, 2);
  else if (typeof nextState === "number") return nextState;
  else return nextState;
}

/**
 * Logs state change and logs them to console
 * @param {string} key - object key of state
 * @param {string} event - event name
 * @param {*} prevState - previous state value
 * @param {*} nextState - next state value
 */
function consoleLogChanges(
  key: string,
  event: string,
  prevState: any,
  nextState: any
) {
  console.log(
    `%c${new Date()
      .toTimeString()
      .substr(0, 8)} %cevent: %c${event} %cstate: %c${
      key as string
    } %cvalue: %c${handleValue(prevState)} %cnewvalue: %c${handleValue(
      nextState
    )}`,
    "color: black",
    "color: grey",
    "color: black",
    "color: grey",
    "color: black",
    "color: grey",
    "color: black",
    "color: grey",
    "color: black"
  );
}
