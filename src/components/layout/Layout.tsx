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
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-b from-white via-sky-50 to-white dark:from-gray-900 dark:via-slate-850 dark:to-gray-900">
      {variant === "page" ? (
        <>
          {showHeader && <Header />}
          <main className="flex flex-col items-center flex-1 w-full">
            <div className="max-w-4xl px-4 py-6 mx-auto md:py-12 md:bg-white dark:md:bg-gray-900 md:shadow-sm md:border-1 md:mt-10 md:mb-5 rounded-xl md:px-19">
              {children}
            </div>
          </main>
          {showFooter && <Footer />}
        </>
      ) : (
        <>
          {showHeader && <Header />}
          <main className="flex flex-col items-center flex-1 w-full">
            {children}
          </main>
          {showFooter && <Footer />}
        </>
      )}
    </div>
  );
}
