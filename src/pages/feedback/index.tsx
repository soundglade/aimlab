import { Layout } from "@/components/layout/Layout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";

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
      <header className="mb-12">
        <h1 className="text-3xl text-center md:text-4xl font-medium tracking-tight mb-3">
          Feedback
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Thank you for taking the time to share your feedback with us. Whether
          you'd like to report bugs, suggest new features, or share what you
          appreciate about the project - we welcome it all. If you provide
          contact information, we'll do our best to follow up with you directly.
          As a collaborative project, your input is invaluable in helping us
          improve and grow. 🙏
        </p>
      </header>

      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="message">Your feedback</Label>
            <Textarea
              id="message"
              placeholder="Share your suggestions, report bugs, or tell us what you think..."
              className="min-h-64 bg-background"
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
              className="bg-background"
              placeholder="Email address or social media handle for follow-up"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
          </div>

          <div className="pt-2 flex justify-center">
            <Button
              type="submit"
              disabled={
                isSubmitting || submitStatus === "success" || !message.trim()
              }
              className="w-full md:w-40 mx-auto"
            >
              {isSubmitting ? "Submitting..." : "Send"}
            </Button>
          </div>

          {submitStatus === "success" && (
            <Alert variant="default" className="bg-primary/10 border-primary">
              <CheckCircle className="h-4 w-4 text-primary" />
              <AlertTitle>Thank you!</AlertTitle>
              <AlertDescription>
                Your feedback has been successfully submitted. We appreciate
                your input!
              </AlertDescription>
            </Alert>
          )}

          {submitStatus === "error" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Something went wrong while submitting your feedback. Please try
                again later.
              </AlertDescription>
            </Alert>
          )}
        </form>
      </div>
    </Layout>
  );
}
