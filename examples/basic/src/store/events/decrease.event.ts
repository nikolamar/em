import { eventState } from "../store";

const state = eventState("decrease");

export function decrease() {
  const [, setValue] = state("value");

  setValue((value: number) => value - 1);
}
