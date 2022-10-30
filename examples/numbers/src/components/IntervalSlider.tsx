import React from "react";
import Slider from "react-smooth-range-input";
import { useState } from "../store/store";
import { slider } from "../store/events/slider.event";

export function IntervalSlider() {
  const [interval] = useState("interval");

  return <Slider value={interval} min={0} max={100} onChange={slider} />;
}
