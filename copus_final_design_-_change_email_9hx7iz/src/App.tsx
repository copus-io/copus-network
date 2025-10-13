import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { ChangeEmail } from "./screens/ChangeEmail/ChangeEmail";
import { EnterCode } from "./screens/EnterCode/EnterCode";
import { NewEmail } from "./screens/NewEmail/NewEmail";
import { VerifyEmail } from "./screens/VerifyEmail/VerifyEmail";

const router = createBrowserRouter([
  {
    path: "/*",
    element: <ChangeEmail />,
  },
  {
    path: "/change-email",
    element: <ChangeEmail />,
  },
  {
    path: "/verify-email",
    element: <VerifyEmail />,
  },
  {
    path: "/new-email",
    element: <NewEmail />,
  },
  {
    path: "/enter-code",
    element: <EnterCode />,
  },
]);

export const App = () => {
  return <RouterProvider router={router} />;
};
