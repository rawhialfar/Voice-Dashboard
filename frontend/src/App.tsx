import React from "react";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import Sidebar from "./pages/Sidebar";
import Dashboard from "./tabs/Analytics";
import PlanMenu from "./pages/PlanMenu";
import Conversations from "./tabs/Converstations";
import Settings from "./tabs/Settings";
import Billing from "./tabs/Billing";
import ProtectedRoute from "./auth/authRoute";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Analytics from "./tabs/Analytics";
import VoiceAgents from "./tabs/VoiceAgents";
import { ThemeProvider } from "./contexts/ThemeContext";
import { OnboardingProvider } from './components/Onboarding/OnboardingManager';
import Organization from "./tabs/Organization";

const MainLayout: React.FC = () => (
  <div className="flex">
    <ThemeProvider>
      <OnboardingProvider>
        <Sidebar onChangelogClick={function (): void {
          throw new Error("Function not implemented.");
        } } />
        <Outlet />
      </OnboardingProvider>
    </ThemeProvider>
  </div>
);

const MainRouter = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage/>
  },
  {
    path: "/signup",
    element: <SignupPage/>
  },
  {
    path: "/plan",
    element: <PlanMenu />
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: "conversations", element: <Conversations /> },
      { path: "analytics", element: <Analytics /> },
      { path: "billing", element: <Billing /> },
      { path: "voiceagents", element: <VoiceAgents /> },
      { path: "organization", element: <Organization /> },
      { path: "settings", element: <Settings /> },
    ]
  }
]);

const App: React.FC = () => {
  return <RouterProvider router={MainRouter} />;
};

export default App;