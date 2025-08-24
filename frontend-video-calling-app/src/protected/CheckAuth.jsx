import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

function Checkauth({ children, protectedRoute }) {
  const navigate = useNavigate();
  const { accessToken: learnerAccesstoken, loading } = useUser();

  useEffect(() => {
    if (!loading) {
      if (protectedRoute && !learnerAccesstoken) {
        navigate("/learner/login");
      } else if (!protectedRoute && learnerAccesstoken) {
        navigate("/");
      }
    }
  }, [loading, learnerAccesstoken, protectedRoute, navigate]);

  if (loading) return <div>Loading...</div>;

  return <>{children}</>;
}

export default Checkauth;
