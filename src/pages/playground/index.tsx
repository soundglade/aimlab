import PlaygroundLayout from "@/components/playground/PlaygroundLayout";

export default function PlaygroundDashboard() {
  return (
    <PlaygroundLayout>
      <h1 className="text-2xl font-bold mb-4">Playground Dashboard</h1>
      <p>
        Welcome to the AI Meditation experiments playground. Select an
        experiment from the sidebar.
      </p>
    </PlaygroundLayout>
  );
}
