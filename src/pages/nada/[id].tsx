import { useRouter } from "next/router";
import dynamic from "next/dynamic";

// Simplified dynamic import with default export
const NadaPage = dynamic(() => import("@/components/nada/NadaPage"), {
  ssr: false,
});

export default function NadaSessionPage() {
  const router = useRouter();
  const { id } = router.query;

  // Wait for the router to be ready and have the id
  if (!router.isReady || !id || typeof id !== "string") {
    return null;
  }

  return <NadaPage sessionId={id} />;
}
