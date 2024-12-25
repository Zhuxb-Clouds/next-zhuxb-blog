import type { NextPage } from "next";
import Head from "next/head";
import style from "../styles/home.module.css";
import PostList, { postsData } from "../components/postList";
import { getSortedPostsData } from "../utils/posts";

import DarkModeSwitch from "../components/Header/DarkModeSwitch";

const homePage: NextPage<postsData> = ({ postsData }) => {
  return (
    <div>
      <Head>
        <title>Zhuxb</title>
      </Head>
      <div className={style.home}>
        <div className={style.intro}>
          <span>Hi,I&apos;m Zhuxb. <DarkModeSwitch /></span>
          
          <p>Front-end developer / Writer / Galgame producer.</p>
          <p>Share Everything I know.</p>
        </div>
        <div className={style.posts}>
          <p>History Post</p>
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
      postsData: postsData.slice(0, 12),
    },
  };
}
