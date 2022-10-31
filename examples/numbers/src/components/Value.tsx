import React from "react";
import { useState } from "../store/store";

export const Value = ({ stateKey }: { stateKey: string }) => {
  const [count] = useState(stateKey);

  return <h5>{count}</h5>;
};
