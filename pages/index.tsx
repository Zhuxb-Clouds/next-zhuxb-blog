
import Link from "next/link";
import type { NextPage } from "next";
import Head from "next/head";
import style from "../styles/home.module.css";
import PostList, { postsData } from "../components/postList";
import { getSortedPostsData } from "../utils/posts";

const homePage: NextPage<postsData> = ({ postsData }) => {
  return (
    <div>
      <Head>
        <title>Zhuxb&apos;s blog</title>
      </Head>
      <div className={style.home}>
        <div className={style.intro}>
          <span>
            你好👋！我是
            <code>
              <ruby>
                朱仙变
                <rp>(</rp>
                <rt>Zhuxb</rt>
                <rp>)</rp>
              </ruby>
            </code>
            。
          </span>

        </div>
        <div className={style.posts}>
          <p>历史博文</p>
          <PostList postsData={postsData} />
          <Link href={"/posts"}>查看更多 {"->"} </Link>
        </div>
      </div>
    </div>
  );
};
export default homePage;

export async function getStaticProps() {
  const postsData = getSortedPostsData();
  return {
    props: {
      postsData: postsData.slice(0, 5),
    },
  };
}
