import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Loader from "../components/Loader";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader label="Checking session..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;
