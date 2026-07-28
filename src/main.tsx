// import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import { router } from "./routes";
import "./index.css";
import "leaflet/dist/leaflet.css";
import { NotificationProvider } from "./hooks/NotificationContext";
import { AssignLoadProvider } from "./pages/assign_loads/AssignLoadContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <NotificationProvider>
      <AssignLoadProvider>
      <RouterProvider router={router} />
      </AssignLoadProvider>
    </NotificationProvider>
  </Provider>,
);
