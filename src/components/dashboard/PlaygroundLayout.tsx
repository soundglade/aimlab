import Link from "next/link";
import { ReactNode } from "react";
import Dashboard from "./DashboardLayout";

interface PlaygroundLayoutProps {
  children: ReactNode;
}

export default function PlaygroundLayout({ children }: PlaygroundLayoutProps) {
  const sidebarContent = (
    <nav>
      <ul className="space-y-1">
        <li>
          <Link
            href="/playground"
            className="hover:bg-muted block rounded px-4 py-2"
          >
            Dashboard
          </Link>
        </li>
        <li>
          <Link
            href="/playground/chatgpt-meditation-samples"
            className="hover:bg-muted block rounded px-4 py-2"
          >
            ChatGPT Samples
          </Link>
        </li>
        <li>
          <Link
            href="/playground/elevenlabs-voice"
            className="hover:bg-muted block rounded px-4 py-2"
          >
            ElevenLabs Voice
          </Link>
        </li>
      </ul>
    </nav>
  );

  return <Dashboard sidebarContent={sidebarContent}>{children}</Dashboard>;
}
