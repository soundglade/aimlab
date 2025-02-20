import ProtectedRouteLogin from "@/components/auth/ProtectedRouteLogin";

export default function PlaygroundLogin() {
  return (
    <ProtectedRouteLogin
      title="Playground Access"
      description="Enter password to access the playground"
      authEndpoint="/api/auth/playground"
      redirectPath="/playground"
      loadingText="Accessing..."
      buttonText="Enter Playground"
    />
  );
}
