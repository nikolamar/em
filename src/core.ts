import React from "react";
import produce from "immer";
import { BLUE500, PINK500, TEAL500 } from "./colors";
import { msg } from "./msg";
import type {
  EM,
  Handler,
  Callback,
  StateProviderProps,
  CompWithStateProps,
} from "./types";

const em: EM = {
  event: {},
  eventlog: false,
  statelog: false,
  persistent: false,
  lineHeight: "1em",
  valColor: TEAL500,
  eveColor: PINK500,
  keyColor: BLUE500,
};

let timeoutStore = 0;
let timeoutState = 0;

let stateMapRef: Map<string, any>;
let setStateRef: (newState: Map<string, any>) => void;

const EventContext = React.createContext({} as any);

/**
 * Create event function
 * @param {string} name - Event name
 * @param {function} handler - Event handler function
 */
export function event(name: string, handler: Handler) {
  if (name === "") {
    throw "Event name can't be empty string";
  } else if (typeof name !== "string") {
    throw "Event name is not a string";
  } else if (em.event[name]) {
    throw `This event name "${name}" already exist`;
  } else if (typeof handler !== "function") {
    throw "Event handler is not a function";
  }

  em.event[name] = (...args) => {
    if (em.eventlog) {
      console.log(
        `eve: %c${name}`,
        `line-height: ${em.lineHeight}; color: ${em.eveColor}`
      );
    }
    typeof handler === "function" && handler(...args);
  };

  return em.event[name];
}

/**
 * Get by key an array with state and callback function
 * @param {string} key - Get by key an array with state and callback function
 */
export function state<T = any>(key: string) {
  const value = stateMapRef?.get(key);
  return [
    value,
    (callback: Callback) => {
      const immValue = produce(value, callback);
      const newValue = stateMapRef?.set(key, immValue);

      if (em.statelog) {
        // log key state
        console.log(
          `key: %c${key}`,
          `line-height: ${em.lineHeight}; color: ${em.keyColor}`
        );

        // log new value state
        const logValue = newValue?.get(key);
        if (typeof logValue === "string" && logValue !== "") {
          console.log(
            `val: %c${logValue}`,
            `line-height: ${em.lineHeight}; color: ${em.valColor}`
          );
        } else if (logValue === "") {
          console.log(
            "val: %cempty string",
            `line-height: ${em.lineHeight}; color: ${em.valColor}`
          );
        } else if (typeof logValue === "boolean") {
          console.log(
            `val: %c${logValue}`,
            `line-height: ${em.lineHeight}; color: ${em.valColor}`
          );
        } else if (logValue === null) {
          console.log(
            "val: %cnull object",
            `line-height: ${em.lineHeight}; color: ${em.valColor}`
          );
        } else if (logValue === undefined) {
          console.log(
            "val: %cundefined",
            `line-height: ${em.lineHeight}; color: ${em.valColor}`
          );
        } else if (typeof logValue === "object") {
          console.log(
            `val: %c${JSON.stringify(logValue, null, 2)}`,
            `line-height: ${em.lineHeight}; color: ${em.valColor}`
          );
        } else if (typeof logValue === "number") {
          console.log(
            `val: %c${logValue}`,
            `line-height: ${em.lineHeight}; color: ${em.valColor}`
          );
        } else {
          console.log(logValue);
        }
      }

      setStateRef(newValue);
    },
  ];
}

/**
 * Set state by key and callback function
 * @param {string} key - Set state by key from Map object that holds key-value pairs
 * @param {function} callback - Function, called the recipe, that is passed a draft to which we can apply straightforward mutations
 */
export function setStateByKey(key: string, callback: Callback) {
  const value = stateMapRef?.get(key);
  const immValue = produce(value, callback);
  const newValue = stateMapRef?.set(key, immValue);
  setStateRef(newValue);
}

/**
 * ReactJS HOC — injects requested states from the second argument
 * @param {Object} component - React Component
 * @param {Array.<string>} keys - Get an array of states in prop by adding a second argument array of keys
 */
export function withState<T = any>(component: React.FC<T>, keys: string[]) {
  return ({ children, ...rest }: CompWithStateProps) => {
    const context = React.useContext(EventContext);
    const states = keys.map((key) => context.get(key));
    const props = { ...rest, states } as any;

    return React.useMemo(() => {
      return React.createElement(component, props, children);
    }, states);
  };
}

export function Provider({
  children,
  value,
  onChange,
  eventlog = false,
  statelog = false,
  persistent = false,
}: StateProviderProps) {
  const [state, setState] = React.useState(value);
  const [ready, setReady] = React.useState(false);

  const handleSet = React.useCallback(
    (newState: Map<string, any>) => {
      stateMapRef = new Map(newState);
      setState(stateMapRef);

      if (typeof onChange === "function") {
        cancelAnimationFrame(timeoutState);
        timeoutState = requestAnimationFrame(() => {
          onChange(stateMapRef);
        });
      }

      if (persistent) {
        cancelAnimationFrame(timeoutStore);
        timeoutStore = requestAnimationFrame(() => {
          try {
            if (!stateMapRef?.entries) {
              throw Error("State reference is no a Map object");
            }
            localStorage.setItem(
              "emstates",
              JSON.stringify(Array.from(stateMapRef.entries()))
            );
          } catch (e) {
            console.log("Error saving states on storage", e);
          }
        });
      }
    },
    [onChange, persistent]
  );

  React.useEffect(() => {
    stateMapRef = value;
    setStateRef = handleSet;
    setReady(true);
  }, [value, handleSet]);

  React.useEffect(() => {
    if (persistent) {
      try {
        const emStatesString = localStorage.getItem("emstates");
        if (emStatesString) {
          const emParsedStates = JSON.parse(emStatesString);
          if (typeof emParsedStates === "object") {
            handleSet(new Map(emParsedStates));
          } else {
            throw "Parsed state is not a object";
          }
        }
      } catch (e) {
        console.log("Error loading state from storage", e);
      }
    }
  }, [persistent, handleSet]);

  React.useEffect(() => {
    em.eventlog = eventlog;
    em.statelog = statelog;
    em.persistent = persistent;
  }, [eventlog, statelog, persistent]);

  if (!ready) {
    return null;
  }

  return React.createElement(EventContext.Provider, { value: state }, children);
}

em.state = state;
em.setStateByKey = setStateByKey;

// send friendly message tip to the console
console.log(`%c ${msg}`, "color: #2979FF");

(<any>window).em = em;
