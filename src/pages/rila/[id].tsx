import { useRouter } from "next/router";
import dynamic from "next/dynamic";

// Simplified dynamic import with default export
const RilaPage = dynamic(() => import("@/components/rila/Rila"), {
  ssr: false,
});

export default function RilaSessionPage() {
  const router = useRouter();
  const { id } = router.query;

  // Wait for the router to be ready and have the id
  if (!router.isReady || !id || typeof id !== "string") {
    return null;
  }

  return <RilaPage sessionId={id} isPrivate={false} />;
}
