import dynamic from "next/dynamic";

// Simplified dynamic import with default export
const RilaPage = dynamic(() => import("@/components/rila/Rila"), {
  ssr: false,
});

export default function RilaIndexPage() {
  return <RilaPage isPrivate={false} />;
}
