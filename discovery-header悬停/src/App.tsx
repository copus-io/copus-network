import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { NewExplore } from "./screens/NewExplore";

const router = createBrowserRouter([
  {
    path: "/*",
    element: <NewExplore />,
  },
]);

export const App = () => {
  return <RouterProvider router={router} />;
};
