import React from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext"; 

function Checkauth({ children, protectedRoute }) {
  const navigate = useNavigate();
  const {  accessToken, loading } = useUser();

  if (loading) return <div>Loading...</div>;

  if (protectedRoute && !accessToken) {
    navigate("/user/signup");
    return null;
  }

  if (!protectedRoute && accessToken) {
    navigate("/");
    return null;
  }

  return <>{children}</>;
}

export default Checkauth;
