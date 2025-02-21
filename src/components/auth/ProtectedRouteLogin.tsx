import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";

interface ProtectedRouteLoginProps {
  title: string;
  description: string;
  authEndpoint: string;
  redirectPath: string;
  loadingText?: string;
  buttonText?: string;
}

export default function ProtectedRouteLogin({
  title,
  description,
  authEndpoint,
  redirectPath,
  loadingText = "Accessing...",
  buttonText = "Enter",
}: ProtectedRouteLoginProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [targetPath, setTargetPath] = useState(redirectPath);

  // Update target path when query parameters change
  useEffect(() => {
    const redirectQuery = router.query.redirect;
    if (typeof redirectQuery === "string") {
      setTargetPath(redirectQuery);
    }
  }, [router.query]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(authEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      router.push(targetPath);
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-2xl">{title}</h2>
          <p className="text-muted-foreground mt-2">{description}</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="text-destructive text-sm text-center">{error}</div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? loadingText : buttonText}
          </Button>
        </form>
      </div>
    </div>
  );
}
