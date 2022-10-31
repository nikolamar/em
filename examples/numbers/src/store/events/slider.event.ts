import { increment } from "./increment.event";
import { eventState } from "../store";

const state = eventState("slider");

export function slider(value: number) {
  const [, setInterval] = state("interval");

  setInterval(() => value);
  increment();
}
