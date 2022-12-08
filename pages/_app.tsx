import type { AppProps } from "next/app";
import Layout from "../components/layout";

// redux toolkit
import { Provider } from "react-redux";
import store from "../store/index";

import "../styles/globals.css";
import "../styles/post.css";
import { setEnv } from "../store/darkSlice";
import { useEffect } from "react";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    store.dispatch(
      setEnv({
        document: document,
        window: window,
      })
    );
  });
  return (
    <Provider store={store}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </Provider>
  );
}
