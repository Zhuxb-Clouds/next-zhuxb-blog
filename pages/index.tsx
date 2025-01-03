import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import style from "../styles/home.module.css";
import PostList, { postsData } from "../components/postList";
import { getSortedPostsData } from "../utils/posts";
import GithubSvg from "../public/github.svg";
import DarkModeSwitch from "../components/Header/DarkModeSwitch";

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
          <div style={{ marginBlock: "10px" }}>
            <a target="view_window" href="https://github.com/Zhuxb-Clouds">
              <Image src={GithubSvg} id="svg" alt="" width={20} height={20}></Image>
            </a>
          </div>
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
