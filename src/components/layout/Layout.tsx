import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import Head from "next/head";

export const gradientBackgroundClasses =
  "bg-gradient-to-b from-white via-sky-50 to-white dark:from-gray-900 dark:via-slate-850 dark:to-gray-900";

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
    <div
      className={`flex flex-col items-center overflow-x-hidden min-h-screen ${gradientBackgroundClasses}`}
    >
      <Head>
        <title>AIM Lab - The AI Meditation Playground</title>
        <meta
          name="description"
          content="An experimental space exploring the intersection of AI and meditation."
        />
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://aimlab.soundglade.com" />
        <meta
          property="og:title"
          content="AIM Lab - The AI Meditation Playground"
        />
        <meta
          property="og:description"
          content="An experimental space exploring the intersection of AI and meditation."
        />
        <meta
          property="og:image"
          content="https://aimlab.soundglade.com/og-image.jpg"
        />
        {/* Twitter/X */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://aimlab.soundglade.com" />
        <meta
          property="twitter:title"
          content="AIM Lab - The AI Meditation Playground"
        />
        <meta
          property="twitter:description"
          content="An experimental space exploring the intersection of AI and meditation."
        />
        <meta
          property="twitter:image"
          content="https://aimlab.soundglade.com/og-image.jpg"
        />
      </Head>

      {variant === "page" ? (
        <>
          {showHeader && <Header />}
          <main className="flex w-full flex-1 flex-col items-center">
            <div className="md:border-1 md:px-19 mx-auto max-w-4xl rounded-xl px-4 py-6 md:mb-5 md:mt-10 md:bg-white md:py-12 md:shadow-sm dark:md:bg-gray-900">
              {children}
            </div>
          </main>
          {showFooter && <Footer />}
        </>
      ) : (
        <>
          {showHeader && <Header />}
          <main className="flex w-full flex-1 flex-col items-center">
            {children}
          </main>
          {showFooter && <Footer />}
        </>
      )}
    </div>
  );
}
