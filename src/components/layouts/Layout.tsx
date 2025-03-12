import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
}

export function Layout({
  children,
  showHeader = true,
  showFooter = true,
}: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-sky-50 to-white flex flex-col items-center">
      {showHeader && <Header />}
      <main className="flex-1 w-full flex flex-col items-center">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
}
