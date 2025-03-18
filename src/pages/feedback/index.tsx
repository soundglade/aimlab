import { Layout } from "@/components/layout/Layout";

export default function FeedbackIndex() {
  return (
    <Layout variant="page">
      <header className="mb-20 text-center">
        <h1 className="text-3xl md:text-4xl font-medium tracking-tight mb-3">
          Feedback
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Share your thoughts, suggestions, and feedback with us.
        </p>
      </header>
    </Layout>
  );
}
