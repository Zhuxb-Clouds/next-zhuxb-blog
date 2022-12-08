import Head from "next/head";
import Image from "next/image";
import type { NextPage } from "next";
import style from "../styles/home.module.css";
import PostList, { postsData } from "../components/postList";
import { getSortedPostsData } from "../utils/posts";

import me from "../public/me.jpg";
const homePage: NextPage<postsData> = ({ postsData }) => {
  return (
    <div>
      <Head>
        <title>Zhuxb&apos;s blog</title>
      </Head>
      <div className={style.home}>
        <div className={style.intro}>
          <div className={style.me}>
            <Image src={me} alt="" width={100} height={100}></Image>
          </div>
          <p>你好, 我是朱仙变。</p>
          <p>很高兴认识您。</p>
        </div>
        <div className={style.posts}>
          <p>- 历史博文</p>
          <PostList postsData={postsData} />
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
      postsData,
    },
  };
}
