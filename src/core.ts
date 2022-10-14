import React from "react";
import produce, { enableMapSet as enableImmerMapSet } from "immer";
import type { EM, Callback, ProviderProps, CompWithStateProps } from "./types";

const em: EM = {
  consoleLog: false,
  persistent: false,
  enableMapSet: false,
  performanceLog: false,
};

let timeoutStore = 0;
let timeoutState = 0;

let statesMapRef: Map<string, any>;
let setStatesRef: (newState: Map<string, any>) => void;

const EventContext = React.createContext({} as any);

/**
 * Get by key an array with state and callback function
 * @param {string} key - Get by key an array with state and callback function
 * @param {string} name - Event name
 */
export function state<T = any>(key: string, name?: string) {
  const value = statesMapRef?.get(key);
  return [
    value,
    (callback: Callback) => {
      const immValue = produce(value, callback);
      const newValue = statesMapRef?.set(key, immValue);

      if (em.consoleLog) {
        console.log(
          `%c${new Date()
            .toTimeString()
            .substr(
              0,
              8
            )} %cevent: %c${name} %cstate: %c${key} %cvalue: %c${handleValue(
            value
          )} %cnewvalue: %c${handleValue(immValue)}`,
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

      setStatesRef(newValue);
    },
  ];
}

let perfEnd = 0;
let perfStart = 0;
let perfTime = 0;
let perfAccTime = 0;
let perfTimeout = 0;

/**
 * ReactJS HOC — injects requested states from the second argument
 * @param {Object} component - React Component
 * @param {Array.<string>} keys - Get an array of states in prop by adding a second argument array of keys
 */
export function withState<T = any>(component: React.FC<T>, keys: string[]) {
  return ({ children, ...rest }: CompWithStateProps) => {
    /**
     * This is rendered every single time since it is used with context.
     * I could just ditch context and rerender the component manually.
     */
    if (em.performanceLog) {
      perfStart = performance.now();
    }

    const context = React.useContext(EventContext);
    const states = keys.map((key) => context.get(key));

    if (em.performanceLog) {
      perfEnd = performance.now();
      perfTime = perfEnd - perfStart;
      perfAccTime += perfTime;

      // log each performance measure
      console.log(
        `%c${new Date()
          .toTimeString()
          .substr(0, 8)} %ctime: %c${perfTime}ms %cstates: %c${keys}`,
        "color: black",
        "color: grey",
        "color: black",
        "color: grey",
        "color: black"
      );

      cancelAnimationFrame(perfTimeout);
      perfTimeout = requestAnimationFrame(() => {
        // log accumulate performance measure
        console.log(
          `%c${new Date()
            .toTimeString()
            .substr(0, 8)} %ccumulative time: %c${perfAccTime}ms`,
          "color: black",
          "color: grey",
          "color: black"
        );

        // clear accumulate performance measure
        perfAccTime = 0;
      });
    }

    return React.useMemo(() => {
      /**
       * React.useMemo() compares the states.
       * This is rendered only if the state is changed.
       */
      return React.createElement(
        component as any,
        { ...rest, states },
        children
      );
    }, states);
  };
}

export function Provider({
  states,
  children,
  onChange,
  consoleLog = false,
  persistent = false,
  enableMapSet = false,
  performanceLog = false,
  serializeStates,
  deserializeStates,
}: ProviderProps) {
  const [state, setState] = React.useState(states);
  const [ready, setReady] = React.useState(false);

  const handleSet = React.useCallback(
    (newState: Map<string, any>) => {
      statesMapRef = new Map(newState);
      setState(statesMapRef);

      if (typeof onChange === "function") {
        cancelAnimationFrame(timeoutState);
        timeoutState = requestAnimationFrame(() => {
          onChange(statesMapRef);
        });
      }

      if (persistent) {
        cancelAnimationFrame(timeoutStore);
        timeoutStore = requestAnimationFrame(() => {
          try {
            if (!statesMapRef?.entries) {
              throw Error("State reference is no a Map object");
            }

            if (typeof serializeStates === "function") {
              const result = serializeStates(statesMapRef);
              localStorage.setItem("emstate", JSON.stringify(result));
              return;
            }

            localStorage.setItem(
              "emstates",
              JSON.stringify(Array.from(statesMapRef.entries()))
            );
          } catch (e) {
            console.log("Error saving states on storage", e);
          }
        });
      }
    },
    [onChange, persistent, serializeStates]
  );

  React.useEffect(() => {
    statesMapRef = states;
    setStatesRef = handleSet;
    if (enableMapSet) {
      enableImmerMapSet();
    }
    setReady(true);
  }, [states, handleSet, enableMapSet]);

  React.useEffect(() => {
    if (persistent) {
      try {
        const emstateString = localStorage.getItem("emstate");

        if (!emstateString) {
          return;
        }

        if (typeof deserializeStates === "function") {
          const result = deserializeStates(emstateString);
          handleSet(result);
          return;
        }

        const emParsedStates = JSON.parse(emstateString);

        if (typeof emParsedStates === "object") {
          handleSet(new Map(emParsedStates));
        } else {
          throw "Parsed state is not a object";
        }
      } catch (e) {
        console.log("Error loading state from storage", e);
      }
    }
  }, [persistent, handleSet, deserializeStates]);

  React.useEffect(() => {
    em.consoleLog = consoleLog;
    em.persistent = persistent;
    em.enableMapSet = enableMapSet;
    em.performanceLog = performanceLog;
  }, [performanceLog, consoleLog, persistent, enableMapSet]);

  if (!ready) {
    return null;
  }

  return React.createElement(EventContext.Provider, { value: state }, children);
}

function handleValue(value: any) {
  if (typeof value === "string" && value !== "") return `"${value}"`;
  else if (value === "") return `""`;
  else if (typeof value === "boolean") return value;
  else if (value === null) return null;
  else if (value === undefined) return undefined;
  else if (typeof value === "object" && value.get)
    return JSON.stringify(Object.fromEntries(value), null, 2);
  else if (typeof value === "object") return JSON.stringify(value, null, 2);
  else if (typeof value === "number") return value;
  else return value;
}
