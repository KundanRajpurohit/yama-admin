import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../context/userContext";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { userDetails } = useUser();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    console.log("ProtectedRoute: Checking userDetails =", userDetails);
    // Simulate async check to ensure localStorage is loaded
    setTimeout(() => {
      setIsChecking(false);
    }, 0);
  }, [userDetails]);

  if (isChecking) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!userDetails || !userDetails.accessToken) {
    console.warn(
      "ProtectedRoute: Redirecting to / due to missing userDetails or accessToken"
    );
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
