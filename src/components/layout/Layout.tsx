import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import Head from "next/head";

export const gradientBackgroundClasses =
  "bg-gradient-to-b from-gray-50 via-slate-100 to-gray-50 dark:from-slate-850 dark:via-slate-800 dark:to-slate-850";

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  variant?: "default" | "page";
  showChangelog?: boolean;
}

export function Layout({
  children,
  variant = "default",
  showHeader = true,
  showFooter = true,
  showChangelog = false,
}: LayoutProps) {
  return (
    <div
      className={`flex flex-col items-center overflow-x-hidden min-h-screen ${gradientBackgroundClasses}`}
    >
      <Head>
        <title key="title">AIM Lab - The AI Meditation Playground</title>
        <meta
          key="description"
          name="description"
          content="An experimental space exploring the intersection of AI and meditation."
        />
        {/* Open Graph / Facebook */}
        <meta key="og:type" property="og:type" content="website" />
        <meta
          key="og:url"
          property="og:url"
          content="https://aimlab.soundglade.com"
        />
        <meta
          key="og:title"
          property="og:title"
          content="AIM Lab - The AI Meditation Playground"
        />
        <meta
          key="og:description"
          property="og:description"
          content="An experimental space exploring the intersection of AI and meditation."
        />
        <meta
          key="og:image"
          property="og:image"
          content="https://aimlab.soundglade.com/og-image-2.jpg"
        />
        {/* Twitter/X */}
        <meta
          key="twitter:card"
          property="twitter:card"
          content="summary_large_image"
        />
        <meta
          key="twitter:url"
          property="twitter:url"
          content="https://aimlab.soundglade.com"
        />
        <meta
          key="twitter:title"
          property="twitter:title"
          content="AIM Lab - The AI Meditation Playground"
        />
        <meta
          key="twitter:description"
          property="twitter:description"
          content="An experimental space exploring the intersection of AI and meditation."
        />
        <meta
          key="twitter:image"
          property="twitter:image"
          content="https://aimlab.soundglade.com/og-image-2.jpg"
        />
      </Head>

      {variant === "page" ? (
        <>
          {showHeader && <Header showChangelog={showChangelog} />}
          <main className="flex w-full flex-1 flex-col items-center">
            <div className="md:px-19 mx-auto max-w-4xl rounded-xl px-4 py-6 md:mb-5 md:mt-4 md:bg-white md:py-12 dark:md:bg-gray-900">
              {children}
            </div>
          </main>
          {showFooter && <Footer />}
        </>
      ) : (
        <>
          {showHeader && <Header showChangelog={showChangelog} />}
          <main className="flex w-full flex-1 flex-col items-center">
            {children}
          </main>
          {showFooter && <Footer />}
        </>
      )}
    </div>
  );
}
