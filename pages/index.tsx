import type { NextPage } from "next";
import { useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import style from "../styles/home.module.css";
import Link from "next/link";
import PostList, { postsData } from "../components/postList";
import { getSortedPostsData } from "../utils/posts";
import GithubSvg from "../public/github.svg";
import RssSvg from "../public/rss.svg";
import XhsSvg from "../public/xhs.svg";

import DarkModeSwitch from "../components/Header/DarkModeSwitch";
// instrumentation.ts
import { generateFeedXML } from "../utils/feed";

const TheRoc = () => (
  <a href="https://hrsrive.cn/game/the-roc" className={style.projectCard} target="__blank">
    <div className={style.imageContainer}>
      <img
        src="https://oss.hrsrive.cn/hrsrive/cg06_0302.png"
        style={{
          transformOrigin: "53% 27%",
          transform: "scale(3)",
        }}
        alt=""
      />
    </div>
    <div className={style.projectInfo}>
      <div className={style.projectCardTitle}>大鹏 - The Roc</div>

      <div className={style.projectCardDescription}>
        <p style={{ margin: 0 }}>A story about novel,freedom and her.</p>
      </div>
    </div>
    <div className={style.projectHideTitle}>
      <span>大</span>
      <span>鹏</span>
    </div>
  </a>
);

const homePage: NextPage<postsData> = ({ postsData }) => {
  return (
    <div>
      <Head>
        <title>Zhuxb</title>
      </Head>
      <div className={style.home}>
        <div className={style.intro}>
          <span style={{ fontSize: "36px" }}>
            朱仙变 <DarkModeSwitch />
          </span>

          <p>Full-Stack Developer, Indie Game Creator & Writer.</p>
          <p>Share Everything I know.</p>
          <div style={{ marginBlock: "10px", display: "flex", gap: "10px" }}>
            <a target="view_window" href="https://github.com/Zhuxb-Clouds">
              <Image src={GithubSvg} id="svg" alt="" width={20} height={20}></Image>
            </a>
            <a
              target="view_window"
              href="https://www.xiaohongshu.com/user/profile/61a1f8310000000010005eff"
            >
              <Image src={XhsSvg} id="svg" alt="" width={20} height={20}></Image>
            </a>
            <a
              target="view_window"
              rel="alternate"
              type="application/rss+xml"
              title="RSS"
              href="/feed.xml"
            >
              <Image src={RssSvg} id="svg" alt="" width={20} height={20}></Image>
            </a>
          </div>
        </div>
        <div className={style.posts}>
          <p className={style.sectionTitle}>Works</p>
          <div className={style.projectContainer}>{TheRoc()}</div>
        </div>
        <div className={style.posts}>
          <p className={style.sectionTitle}>
            <Link href="/posts">History Post</Link>
          </p>
          <PostList postsData={postsData} />
        </div>
      </div>
    </div>
  );
};
export default homePage;

export async function getStaticProps() {
  const postsData = getSortedPostsData();
  generateFeedXML();
  return {
    props: {
      postsData: postsData.slice(0, 12),
    },
  };
}
