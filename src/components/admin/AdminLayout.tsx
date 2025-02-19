import Link from "next/link";
import { ReactNode, useState } from "react";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-background p-4 border-r border-border transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0`}
      >
        <div className="flex items-center justify-between md:hidden mb-4">
          <h2 className="text-lg font-bold">Menu</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-primary"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <nav>
          <ul className="space-y-2">
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
              {/* Settings Parent */}
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
      </aside>

      <div className="flex-1">
        <header className="md:hidden p-4 border-b border-border">
          <button onClick={() => setSidebarOpen(true)} className="text-primary">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
