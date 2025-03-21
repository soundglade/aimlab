import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html
      lang="en"
      suppressHydrationWarning
      className="scrollbar-thumb-rounded-full scrollbar-thin scrollbar-thumb-slate-500/10 scrollbar-track-transparent"
    >
      <Head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
