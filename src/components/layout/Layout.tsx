import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  variant?: "default" | "page";
}

export function Layout({
  children,
  variant = "default",
  showHeader = true,
  showFooter = true,
}: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-sky-50 to-white flex flex-col items-center">
      {variant === "page" ? (
        <div className="max-w-5xl bg-white mx-auto flex flex-col items-center">
          <>
            {showHeader && <Header />}
            <main className="flex-1 w-full flex flex-col items-center">
              <div className="max-w-4xl bg-white mx-auto px-4 md:px-19 py-12">
                {children}
              </div>
            </main>
            {showFooter && <Footer />}
          </>
        </div>
      ) : (
        <>
          {showHeader && <Header />}
          <main className="flex-1 w-full flex flex-col items-center">
            {children}
          </main>
          {showFooter && <Footer />}
        </>
      )}
    </div>
  );
}
