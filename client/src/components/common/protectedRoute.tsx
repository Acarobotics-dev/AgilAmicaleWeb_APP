import { Navigate, useLocation } from "react-router-dom";
import { ROUTE_CONFIG, ROUTE_PATHS } from "@/config/routes";

interface User {
  role?: string;
  status?: string;
}

interface ProtectedRouteProps {
  authenticated: boolean;
  user?: User | null;
  element: React.ReactElement;
}

export default function ProtectedRoute({ authenticated, user, element }: ProtectedRouteProps) {
  const location = useLocation();
  const { pathname } = location;

  // ✅ Allow unauthenticated users to access login and signup
  if (!authenticated && ROUTE_CONFIG.publicOnly.some((path) => pathname === path)) {
    return element;
  }

  // ❌ Prevent unauthenticated users from accessing protected paths
  if (!authenticated && ROUTE_CONFIG.protected.some((path) => pathname.startsWith(path))) {
    return <Navigate to={ROUTE_PATHS.LOGIN} />;
  }

  // ❌ Prevent unauthenticated users from accessing confirmation pages
  if (!authenticated && ROUTE_CONFIG.confirmation.some((path) => pathname.startsWith(path))) {
    return <Navigate to={ROUTE_PATHS.LOGIN} />;
  }

  // ✅ Adherent with "En Attente" should be redirected to /waitingforconfirmation
  if (
    authenticated &&
    user?.role === "adherent" &&
    user.status === "En Attente" &&
    !pathname.includes(ROUTE_PATHS.WAITING_CONFIRMATION)
  ) {
    return <Navigate to={ROUTE_PATHS.WAITING_CONFIRMATION} />;
  }

  // ✅ Adherent with "Refusé" should be redirected to /deniedforconfirmation
  if (
    authenticated &&
    user?.role === "adherent" &&
    user.status === "Refusé" &&
    !pathname.includes(ROUTE_PATHS.DENIED_CONFIRMATION)
  ) {
    return <Navigate to={ROUTE_PATHS.DENIED_CONFIRMATION} />;
  }

  // ❌ Approved users should NOT access confirmation pages
  if (
    authenticated &&
    user?.status === "Approuvé" &&
    ROUTE_CONFIG.confirmation.some((path) => pathname.startsWith(path))
  ) {
    return <Navigate to={ROUTE_PATHS.HOME} />;
  }

  // ❌ Authenticated + approved users should NOT visit login/signup
  if (
    authenticated &&
    user?.status === "Approuvé" &&
    ROUTE_CONFIG.publicOnly.some((path) => pathname === path)
  ) {
    return <Navigate to={ROUTE_PATHS.HOME} />;
  }

  // ❌ Adherent cannot access /responsable
  if (
    authenticated &&
    user?.role === "adherent" &&
    user?.status === "Approuvé" &&
    ROUTE_CONFIG.roleSpecific.responsable.some((path) => pathname.includes(path))
  ) {
    return <Navigate to={ROUTE_PATHS.HOME} />;
  }

  // ✅ Default: allow the route
  return element;
}
