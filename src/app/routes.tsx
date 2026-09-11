import { createBrowserRouter } from "react-router";
import { Home } from "./pages/Home";
import { GenerateInvite } from "./pages/GenerateInvite";
import { AdminPanel } from "./pages/AdminPanel";

export const router = createBrowserRouter([
  {
    path: "/",
    children: [
      { index: true, Component: Home },
      { path: "convite", Component: GenerateInvite },
      { path: "admin", Component: AdminPanel },
    ],
  },
]);