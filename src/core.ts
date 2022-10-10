import React from "react";
import produce, { enableMapSet as enableImmerMapSet } from "immer";
import type {
  EM,
  Handler,
  Callback,
  ProviderProps,
  CompWithStateProps,
} from "./types";

const em: EM = {
  events: new Set([]),
  consolelog: false,
  persistent: false,
  enableMapSet: false,
};

let timeoutStore = 0;
let timeoutState = 0;

let statesMapRef: Map<string, any>;
let setStatesRef: (newState: Map<string, any>) => void;

const EventContext = React.createContext({} as any);

/**
 * Create event function
 * @param {string} name - Event name
 * @param {function} handler - Event handler function
 */
export function event(name: string, handler: Handler) {
  if (name === "") {
    throw "Event name can't be empty string";
  }

  if (typeof name !== "string") {
    throw "Event name is not a string";
  }

  if (em.events.has(name)) {
    throw `This event name "${name}" already exist`;
  }

  if (typeof handler !== "function") {
    throw "Event handler is not a function";
  }

  em.events.add(name);

  return (...args: any[]) => handler(...args);
}

/**
 * Get by key an array with state and callback function
 * @param {string} key - Get by key an array with state and callback function
 */
export function state<T = any>(key: string, name?: string) {
  const value = statesMapRef?.get(key);
  return [
    value,
    (callback: Callback) => {
      const immValue = produce(value, callback);
      const newValue = statesMapRef?.set(key, immValue);

      if (em.consolelog) {
        const date = new Date();
        const seconds = date.getSeconds();
        const minutes = date.getMinutes();
        const hour = date.getHours();
        const time = `${hour}:${minutes}:${seconds}`;
        console.log(
          `%c${time} %cevent: %c${name} %cstate: %c${key} %cvalue: %c${handleValue(
            value
          )} %cnewvalue: %c${handleValue(newValue?.get(key))}`,
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

/**
 * Set state by key and callback function
 * @param {string} key - Set state by key from Map object that holds key-value pairs
 * @param {function} callback - Function, called the recipe, that is passed a draft to which we can apply straightforward mutations
 */
export function setStateByKey(key: string, callback: Callback) {
  const value = statesMapRef?.get(key);
  const immValue = produce(value, callback);
  const newValue = statesMapRef?.set(key, immValue);
  setStatesRef(newValue);
}

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
    const context = React.useContext(EventContext);
    const states = keys.map((key) => context.get(key));

    return React.useMemo(() => {
      /**
       * React.useMemo() compares the states.
       * This is rendered only if the state is changed.
       */
      const props = { ...rest, states } as any;
      return React.createElement(component as any, props, children);
    }, states);
  };
}

export function Provider({
  states,
  children,
  onChange,
  consolelog = false,
  persistent = false,
  enableMapSet = false,
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
    em.consolelog = consolelog;
    em.persistent = persistent;
    em.enableMapSet = enableMapSet;
  }, [consolelog, persistent, enableMapSet]);

  if (!ready) {
    return null;
  }

  return React.createElement(EventContext.Provider, { value: state }, children);
}

function handleValue(value: any) {
  if (typeof value === "string" && value !== "") return `"${value}"`;
  if (value === "") return `""`;
  if (typeof value === "boolean") return value;
  if (value === null) return null;
  if (value === undefined) return undefined;
  if (typeof value === "object" && value.get)
    return JSON.stringify(Object.fromEntries(value), null, 2);
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  if (typeof value === "number") return value;
  return value;
}
