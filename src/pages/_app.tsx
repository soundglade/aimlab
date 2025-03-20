import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Head>
        <title>AIM Lab</title>
      </Head>
      <Component {...pageProps} />
      <Toaster />
    </ThemeProvider>
  );
}
