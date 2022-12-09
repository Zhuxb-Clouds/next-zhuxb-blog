import Head from "next/head";
function about() {
  return (
    <div>
      <Head>
        <title>About - Zhuxb&apos; Blog</title>
      </Head>
      <h2 className="title">About</h2>
      <p>
        Hi, 我是 <strong>朱仙变</strong> 。
      </p>
      <p>很高兴认识您，这是我的技术博客，主要分享前端相关的文章。</p>
      <p>您还可以在 Github 、掘金等平台上找到我。</p>
    </div>
  );
}

export default about;
