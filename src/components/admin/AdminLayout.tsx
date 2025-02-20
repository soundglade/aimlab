import Link from "next/link";
import { ReactNode } from "react";
import BaseLayout from "../layouts/BaseLayout";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const sidebarContent = (
    <nav>
      <ul className="space-y-1">
        <li>
          <Link
            href="/admin"
            className="block px-4 py-2 rounded hover:bg-muted"
          >
            Dashboard
          </Link>
        </li>
        <li>
          <Link
            href="/admin/storage"
            className="block px-4 py-2 rounded hover:bg-muted"
          >
            Storage
          </Link>
        </li>
        <li>
          <Link
            href="/admin/database"
            className="block px-4 py-2 rounded hover:bg-muted"
          >
            Database
          </Link>
        </li>
        <li>
          <Link
            href="/admin/meditations"
            className="block px-4 py-2 rounded hover:bg-muted"
          >
            Meditations
          </Link>
        </li>
        <li>
          <span className="block px-4 py-2 font-semibold text-muted-foreground">
            Settings
          </span>
          <ul className="pl-4 mt-1 space-y-1">
            <li>
              <Link
                href="/admin/settings"
                className="block px-4 py-2 rounded hover:bg-muted"
              >
                General
              </Link>
            </li>
            <li>
              <Link
                href="/admin/settings/profile"
                className="block px-4 py-2 rounded hover:bg-muted"
              >
                Profile
              </Link>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
  );

  return <BaseLayout sidebarContent={sidebarContent}>{children}</BaseLayout>;
}
