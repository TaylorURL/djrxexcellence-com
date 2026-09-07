import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import PageFallback from "@/components/app/PageFallback";

export default function RequireAuth({ children, agentOnly = false }) {
  const { user, isAgent, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageFallback />;
  if (!user) {
    return (
      <Navigate to="/sign-in" state={{ from: location.pathname }} replace />
    );
  }
  if (agentOnly && !isAgent) return <Navigate to="/" replace />;

  return children;
}
