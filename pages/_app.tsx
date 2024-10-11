/*
 * @Date: 2022-12-11 19:32:26
 * @FileName:
 * @FileDescription:
 */
import type { AppProps } from "next/app";
import Layout from "../components/layout";

import "../styles/globals.css";
import "../styles/post.css";


export default function App({ Component, pageProps }: AppProps) {

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
