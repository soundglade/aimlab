import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("sending");
    try {
      const res = await fetch("https://aimlab.substack.com/api/v1/free", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Signup failed");
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-4">
      <div className="space-y-1">
        <label htmlFor="email" className="block text-sm">
          Join the AIM Lab newsletter for weekly updates
        </label>
        <Input
          id="email"
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "sending" || status === "success"}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Button
          type="submit"
          disabled={status === "sending" || status === "success"}
        >
          {status === "sending"
            ? "Sending…"
            : status === "success"
            ? "Subscribed"
            : "Subscribe"}
        </Button>
        {status === "success" && (
          <span className="text-success text-sm">Thank you!</span>
        )}
      </div>

      {status === "error" && (
        <p className="text-destructive text-sm">
          Oops, something went wrong. Please try again.
        </p>
      )}
    </form>
  );
}

export { SubscribeForm };
