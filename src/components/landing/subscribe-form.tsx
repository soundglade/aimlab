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
    <form onSubmit={handleSubmit} className="mx-auto my-3 md:my-0">
      <div className="flex flex-col gap-2 space-y-2 sm:flex-row sm:items-center sm:gap-8 sm:space-y-0">
        <label htmlFor="email" className="whitespace-nowrap text-lg">
          Join the weekly newsletter
        </label>

        <Input
          id="email"
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "sending" || status === "success"}
          className="flex-1"
        />
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
      </div>

      {status === "success" && (
        <span className="text-success text-sm">Thank you!</span>
      )}

      {status === "error" && (
        <p className="text-destructive text-sm">
          Oops, something went wrong. Please try again.
        </p>
      )}
    </form>
  );
}

export { SubscribeForm };
