import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
    // Check for auth token in localStorage
    const token = localStorage.getItem("authToken");
    if (!token) {
        // Redirect to login if not authenticated
        return <Navigate to="/login" replace />;
    }
    return children;
}
