import Link from "next/link";
import { ReactNode } from "react";
import BaseLayout from "../layouts/BaseLayout";

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
            className="block px-4 py-2 rounded hover:bg-muted"
          >
            Dashboard
          </Link>
        </li>
        <li>
          <Link
            href="/playground/chatgpt-meditation-samples"
            className="block px-4 py-2 rounded hover:bg-muted"
          >
            ChatGPT Samples
          </Link>
        </li>
      </ul>
    </nav>
  );

  return <BaseLayout sidebarContent={sidebarContent}>{children}</BaseLayout>;
}
