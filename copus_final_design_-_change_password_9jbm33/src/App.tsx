import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { ChangePassword } from "./screens/ChangePassword/ChangePassword";
import { EnterCode } from "./screens/EnterCode/EnterCode";
import { NewPassword } from "./screens/NewPassword/NewPassword";
import { VerifyEmail } from "./screens/VerifyEmail";

const router = createBrowserRouter([
  {
    path: "/*",
    element: <ChangePassword />,
  },
  {
    path: "/change-password",
    element: <ChangePassword />,
  },
  {
    path: "/new-password",
    element: <NewPassword />,
  },
  {
    path: "/enter-codeu452",
    element: <EnterCode />,
  },
  {
    path: "/verify-emailu452",
    element: <VerifyEmail />,
  },
]);

export const App = () => {
  return <RouterProvider router={router} />;
};
