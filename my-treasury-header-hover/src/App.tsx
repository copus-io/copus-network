import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { MyTreasureOwner } from "./screens/MyTreasureOwner";

const router = createBrowserRouter([
  {
    path: "/*",
    element: <MyTreasureOwner />,
  },
]);

export const App = () => {
  return <RouterProvider router={router} />;
};
