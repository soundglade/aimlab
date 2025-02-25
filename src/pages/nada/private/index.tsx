import dynamic from "next/dynamic";

// Simplified dynamic import with default export
const NadaPage = dynamic(() => import("@/components/nada/NadaPage"), {
  ssr: false,
});

export default function NadaPrivateIndexPage() {
  return <NadaPage isPrivate={true} />;
}
