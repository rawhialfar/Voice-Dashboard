import React from "react";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import Sidebar from "./pages/Sidebar";
import Dashboard from "./tabs/Analytics";
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

// Fixed MainLayout with proper structure
const MainLayout: React.FC = () => {
  console.log("MainLayout rendering"); // Debug log
  
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

// Wrap the entire app with providers
const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider>
      <OnboardingProvider>
        {children}
      </OnboardingProvider>
    </ThemeProvider>
  );
};

// Routes configuration
const MainRouter = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    path: "/signup",
    element: <SignupPage />
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppProviders>
          <MainLayout />
        </AppProviders>
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
  console.log("App rendering"); // Debug log
  return <RouterProvider router={MainRouter} />;
};

export default App;