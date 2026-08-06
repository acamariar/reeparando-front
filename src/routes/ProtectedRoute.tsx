import { Navigate, Outlet } from "react-router-dom";
import { useBoundStore } from "../store";

type ProtectedRouteProps = {
    allowedLevels?: number[];
    children?: React.ReactNode;
};

export default function ProtectedRoute({
    allowedLevels,
    children,
}: ProtectedRouteProps) {
    const isAuthenticated = useBoundStore((s) => s.isAuthenticated);
    const user = useBoundStore((s) => s.user);
    const token = useBoundStore((s) => s.token);

    if (!isAuthenticated || !token) {
        return <Navigate to="/" replace />;
    }

    if (
        allowedLevels &&
        allowedLevels.length > 0 &&
        !allowedLevels.includes(user.nivel) &&
        user.nivel !== 1
    ) {
        return <Navigate to="/panel" replace />;
    }

    if (children) {
        return <>{children}</>;
    }

    return <Outlet />;
}