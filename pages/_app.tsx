/*
 * @Date: 2022-12-11 19:32:26
 * @FileName:
 * @FileDescription:
 */
import type { AppProps } from "next/app";
import Layout from "../components/layout";
import { I18nProvider } from "../lib/i18n";

import "../styles/globals.css";
import "../styles/post.css";
import "prismjs/themes/prism-okaidia.min.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <I18nProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </I18nProvider>
  );
}
