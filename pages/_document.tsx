import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    const mode =
      typeof window !== "undefined"
        ? localStorage.getItem("mode") || window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : "dark";
    return (
      <Html data-theme={mode}>
        <Head>
          <link
            href="https://fonts.googleapis.com/css?family=Noto+Serif+SC:wght@300;400;500;600;700&display=swap"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&family=ZCOOL+XiaoWei&display=swap"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Afacad+Flux:wght@100..1000&display=swap"
            rel="stylesheet"
          ></link>
          <link href="https://fonts.googleapis.com/css?family=Lato&display=swap" rel="stylesheet" />
          <link href="https://fonts.googleapis.com/css?family=Lora&display=swap" rel="stylesheet" />
          <link
            rel="stylesheet"
            href="https://jsd.cdn.zzko.cn/npm/katex@0.16.0/dist/katex.min.css"
            integrity="sha384-Xi8rHCmBmhbuyyhbI88391ZKP2dmfnOl4rT9ZfRI7mLTdk1wblIUnrIq35nqwEvC"
            crossOrigin="anonymous"
          ></link>
          <link
            rel="stylesheet"
            href="https://jsd.cdn.zzko.cn/npm/@wc1font/fontquan-xin-yi-ji-xiang-song/font.css"
          ></link>
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
