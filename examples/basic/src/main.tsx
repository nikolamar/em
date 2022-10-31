import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
// store
import { Provider } from "./store/store";
// styles
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <Provider>
    <App />
  </Provider>
);
