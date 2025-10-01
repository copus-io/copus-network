import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Create } from "./screens/Create/Create";

const router = createBrowserRouter([
  {
    path: "/*",
    element: <Create />,
  },
]);

export const App = () => {
  return <RouterProvider router={router} />;
};
