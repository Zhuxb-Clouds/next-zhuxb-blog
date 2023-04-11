/*
 * @Date: 2022-12-11 19:32:26
 * @FileName:
 * @FileDescription:
 */
import type { AppProps } from "next/app";
import Layout from "../components/layout";

import "../styles/globals.css";
import "../styles/post.css";

import { useState, useEffect } from "react";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    window.document.documentElement.setAttribute(
      "mode",
      window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    );
  });
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
