import AdminLayout from "@/components/dashboard/AdminLayout";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function AdminStorage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClearCache = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/clear-cache", {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || "Cache cleared successfully.");
      } else {
        setError(data.error || "Failed to clear cache.");
      }
    } catch {
      setError("Failed to clear cache.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="mb-4 text-2xl">Storage Management</h1>
      <p>
        This is a dummy page for managing storage options. Implement your
        storage management features here.
      </p>
      <div className="mt-8 space-y-4">
        <Button variant="outline" onClick={handleClearCache} disabled={loading}>
          {loading ? "Clearing Cache..." : "Clear Cache"}
        </Button>
        {message && <div className="text-success font-medium">{message}</div>}
        {error && <div className="text-destructive font-medium">{error}</div>}
      </div>
    </AdminLayout>
  );
}
