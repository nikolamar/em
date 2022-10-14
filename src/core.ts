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

let states: Map<string, any>;
let setRef: () => void;

const EventContext = React.createContext({} as any);

/**
 * Get by key an array with state and callback function
 * @param {string} key - Get by key an array with state and callback function
 * @param {string} name - Event name
 */
export function state<T = any>(key: string, name?: string) {
  const value = states?.get(key);
  return [
    value,
    (callback: Callback) => {
      const immValue = produce(value, callback);
      states?.set(key, immValue);

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

      /**
       * Prevents multiple renders of same value
       */
      if (immValue === value) return;

      setRef();
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

    React.useContext(EventContext);
    const dependency = keys.map((key) => states.get(key));

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
        { ...rest, states: dependency },
        children
      );
    }, dependency);
  };
}

/**
 * Context Provider for states
 * @param {Map<String, *>} value - initial states
 * @param {*} children - react components
 * @param {callback} onChange - callback function when state is changed
 * @param {boolean} consoleLog - enable console.log state changes
 * @param {boolean} persistent - enable persistent states
 * @param {boolean} enableMapSet - boolean to enable Map and Set in immer
 * @param {boolean} performanceLog - enable performance log of states changes
 * @param {callback} serializeStates - serialize states to string
 * @param {callback} deserializeStates -deserialize states from string
 */
export function Provider({
  value,
  children,
  onChange,
  consoleLog = false,
  persistent = false,
  enableMapSet = false,
  performanceLog = false,
  serializeStates = null,
  deserializeStates = null,
}: ProviderProps) {
  const [state, setState] = React.useState(0);
  const [ready, setReady] = React.useState(false);

  /**
   * React useCallback() set function re-render components which is used with context
   * and call onChange callback function
   */
  const saveState = React.useCallback(() => {
    try {
      if (onChange) {
        if (typeof onChange !== "function") {
          throw new Error("onChange prop in Provider is not a function");
        }

        cancelAnimationFrame(timeoutState);
        timeoutState = requestAnimationFrame(() => {
          onChange(states);
        });
      }

      if (!persistent) {
        return;
      }

      cancelAnimationFrame(timeoutStore);
      timeoutStore = requestAnimationFrame(() => {
        if (!states?.entries) {
          throw new Error("value prop should be a Map object");
        }

        if (serializeStates) {
          if (typeof serializeStates !== "function") {
            throw new Error("serializeStates prop is not a function");
          }

          const result = serializeStates(states);
          localStorage.setItem("emstate", JSON.stringify(result));
          return;
        }

        localStorage.setItem(
          "emstates",
          JSON.stringify(Array.from(states.entries()))
        );
      });
    } catch (e) {
      console.log("error saving states", e);
    }
  }, [onChange, persistent, serializeStates]);

  /**
   *  React useEffetct() to initialize states
   */
  React.useEffect(() => {
    states = value;
    setReady(true);
  }, [value]);

  /**
   * React useEffetct() used to enable immer Map and Set
   */
  React.useEffect(() => {
    if (enableMapSet) enableImmerMapSet();
  }, [enableMapSet]);

  /**
   * React useEffetct() used to set setRef function
   */
  React.useEffect(() => {
    setRef = () => {
      setState(state + 1);
      saveState();
    };
  }, [state, setState, saveState]);

  /**
   * React useEffetct() used to restore states from localStorage
   */
  React.useEffect(() => {
    if (!persistent) {
      return;
    }

    try {
      const emstateString = localStorage.getItem("emstate");

      if (!emstateString) {
        return;
      }

      /**
       * Deserialize states from string if deserializeStates is provided and set states
       * NOTE: this will work event if states are not serializable since user is overriding defaults
       */
      if (deserializeStates) {
        if (typeof deserializeStates !== "function") {
          throw new Error("deserializeStates prop is not a function");
        }

        const result = deserializeStates(emstateString);
        states = new Map<string, any>(result);
        return setState(state + 1);
      }

      /**
       * If deserializeStates is not provided, set states from localStorage
       * NOTE: this will not work if the states are not serializable
       */
      const emParsedStates = JSON.parse(emstateString);

      if (typeof emParsedStates !== "object") {
        throw new Error("parsed state is not a object");
      }

      states = new Map<string, any>(emParsedStates);
      setState(state + 1);
    } catch (e) {
      console.log("error loading state from storage", e);
    }
  }, [deserializeStates, persistent]);

  /**
   * React useEffect() used to set config for emstore
   */
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

/**
 * Function to handle console.log and different types of values
 * @param {*} value - Value to be logged
 */
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
