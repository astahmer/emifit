import "./index.css";

import React from "react";
import App from "./App";
import { createRoot } from "react-dom/client";
import { ToastContainer } from "./functions/toasts";

const root = createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <App />
        <ToastContainer />
    </React.StrictMode>
);
