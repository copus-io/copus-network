import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { SettingWallet } from "./screens/SettingWallet";

const router = createBrowserRouter([
  {
    path: "/*",
    element: <SettingWallet />,
  },
]);

export const App = () => {
  return <RouterProvider router={router} />;
};
