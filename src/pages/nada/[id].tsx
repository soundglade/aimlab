import { useRouter } from "next/router";
import { NadaPage } from "@/components/nada/NadaPage";

export default function NadaSessionPage() {
  const router = useRouter();
  const { id } = router.query;

  // Wait for the router to be ready and have the id
  if (!router.isReady || !id || typeof id !== "string") {
    return null;
  }

  return <NadaPage sessionId={id} />;
}
