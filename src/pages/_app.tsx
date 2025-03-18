import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { Toaster } from "@/components/ui/sonner";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>AIM Lab</title>
      </Head>
      <Component {...pageProps} />
      <Toaster />
    </>
  );
}
