import { eventState } from "../store";

const state = eventState("decrease");

export function decrease() {
  const [, setValue] = state("value");

  setValue((value) => value - 1);
}
