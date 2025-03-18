import { Layout } from "@/components/layout/Layout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function FeedbackIndex() {
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch("/api/submit-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, contact }),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setMessage("");
        setContact("");
      } else {
        setSubmitStatus("error");
      }
    } catch (err) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout variant="page">
      <header className="mb-12 text-center">
        <h1 className="text-3xl md:text-4xl font-medium tracking-tight mb-3">
          Feedback
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Share your thoughts, suggestions, and feedback with us.
        </p>
      </header>

      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="message">Your feedback</Label>
            <Textarea
              id="message"
              placeholder="Share your suggestions, report bugs, or tell us what you think..."
              className="min-h-32"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact">
              <span>Contact information (optional)</span>
            </Label>
            <Input
              id="contact"
              placeholder="Email address or social media handle for follow-up"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Leave your contact information if you'd like us to follow up on
              your feedback.
            </p>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={isSubmitting || !message.trim()}
              variant="outline"
              className="w-full md:w-auto"
            >
              {isSubmitting ? "Submitting..." : "Submit feedback"}
            </Button>
          </div>

          {submitStatus === "success" && (
            <p className="text-primary">Thank you for your feedback!</p>
          )}

          {submitStatus === "error" && (
            <p className="text-destructive">
              Something went wrong. Please try again.
            </p>
          )}
        </form>
      </div>
    </Layout>
  );
}
