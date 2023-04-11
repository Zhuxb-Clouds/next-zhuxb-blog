/*
 * @Date: 2023-03-29 16:49:57
 * @FileName:
 * @FileDescription:
 */
// import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import type { NextPage } from "next";
import style from "../styles/home.module.css";
import PostList, { postsData } from "../components/postList";
import { getSortedPostsData } from "../utils/posts";

const homePage: NextPage<postsData> = ({ postsData }) => {
  return (
    <div>
      <div className={style.home}>
        <div className={style.intro}>
          <span>你好。</span>
          <span>
            我是<code>朱仙变</code>
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
