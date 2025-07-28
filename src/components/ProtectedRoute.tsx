import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { selectAuth } from "../features/auth/authSlice";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const auth = useSelector(selectAuth);
  const location = useLocation();

  // Check if we have a token in the URL parameters
  const params = new URLSearchParams(location.search);
  const hasTokenInUrl = params.has("token");
  const rejectUrl = params.get("rejectUrl");
  // If no auth and no token in URL, redirect to login
  if (!auth && !hasTokenInUrl) {
    // Redirect to login page but save the attempted url
    return (
      <Navigate to="/tao-thiep-mien-phi" state={{ from: location }} replace />
    );
  }

  return <div>{children}</div>;
};

export default ProtectedRoute;
