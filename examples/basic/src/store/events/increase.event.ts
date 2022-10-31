import { eventState } from "../store";

const state = eventState("increase");

export function increase() {
  const [, setValue] = state("value");

  setValue((value: number) => value + 1);
}
