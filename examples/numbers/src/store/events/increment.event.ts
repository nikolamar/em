import { eventState } from "../store";

const state = eventState("increment");

let id: any;

export function increment() {
  const [interval] = state("interval");

  clearInterval(id);

  id = setInterval(() => {
    const key = `counter${Math.floor(Math.random() * 120)}`;
    const [, setCounter] = state(key);
    setCounter((num) => {
      if (num === 100) {
        return 0;
      }
      return num + 1;
    });
  }, interval);

  return () => clearInterval(id);
}
