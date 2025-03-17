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
        <>
          {showHeader && <Header />}
          <main className="flex-1 w-full flex flex-col items-center">
            <div className="max-w-4xl md:bg-white md:shadow-sm md:border-1 md:mt-10 md:mb-5 rounded-xl mx-auto px-4 md:px-19 py-12">
              {children}
            </div>
          </main>
          {showFooter && <Footer />}
        </>
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
