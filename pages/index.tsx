import type { NextPage } from "next";
import { useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import style from "../styles/home.module.css";
import PostList, { postsData } from "../components/postList";
import { getSortedPostsData } from "../utils/posts";
import GithubSvg from "../public/github.svg";
import RssSvg from "../public/rss.svg";
import DarkModeSwitch from "../components/Header/DarkModeSwitch";
// instrumentation.ts
import { generateFeedXML } from "../utils/feed"


const homePage: NextPage<postsData> = ({ postsData }) => {
  return (
    <div>
      <Head>
        <title>Zhuxb</title>
      </Head>
      <div className={style.home}>
        <div className={style.intro}>
          <span>
            Hi,I&apos;m Zhuxb. <DarkModeSwitch />
          </span>

          <p>Front-end developer / Writer / Galgame producer.</p>
          <p>Share Everything I know.</p>
          <div style={{ marginBlock: "10px", display: "flex", gap: "10px" }}>
            <a target="view_window" href="https://github.com/Zhuxb-Clouds">
              <Image src={GithubSvg} id="svg" alt="" width={20} height={20}></Image>
            </a>
            <a target="view_window" rel="alternate" type="application/rss+xml" title="RSS" href="/feed.xml">
              <Image src={RssSvg} id="svg" alt="" width={20} height={20}></Image>
            </a>
          </div>
        </div>
        <div className={style.posts}>
          <p className={style.sectionTitle}>History Post</p>
          <PostList postsData={postsData} />
        </div>
      </div>
    </div>
  );
};
export default homePage;

export async function getStaticProps() {
  const postsData = getSortedPostsData();
  generateFeedXML()
  return {
    props: {
      postsData: postsData.slice(0, 12),
    },
  };
}
