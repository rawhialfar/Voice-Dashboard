import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const checkPath = `${import.meta.env.VITE_BACKEND_URL}/auth/check`;
      console.log("Check path: ",checkPath);
      const response = await fetch(checkPath, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
      });
      if (response.ok) setIsAuthenticated(true);
      setLoading(false);
    };
    checkSession();
  }, []);

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;