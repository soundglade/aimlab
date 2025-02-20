import ProtectedRouteLogin from "@/components/auth/ProtectedRouteLogin";

export default function AdminLogin() {
  return (
    <ProtectedRouteLogin
      title="Admin Login"
      description="Enter password to access admin area"
      authEndpoint="/api/auth/admin"
      redirectPath="/admin"
      loadingText="Logging in..."
      buttonText="Login"
    />
  );
}
