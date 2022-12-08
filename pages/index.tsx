import Head from "next/head";
import style from "../styles/home.module.css";
import type { NextPage, GetStaticProps } from "next";
import Link from "next/link";
import Date from "../components/date";
import { getSortedPostsData } from "../utils/posts";

interface Props {
  allPostsData: {
    date: string;
    title: string;
    id: string;
  }[];
}

export const getStaticProps: GetStaticProps = async () => {
  // 获取文章列表
  const allPostsData = getSortedPostsData();

  return {
    props: {
      allPostsData,
    },
  };
};

const homePage: NextPage<Props> = ({ allPostsData }) => {
  return (
    <div>
      <Head>
        <title>Zhuxb&apos;s blog</title>
      </Head>
      <div className={style.home}>
        <div className={style.intro}>
          <p>你好, 我是朱仙变。</p>
          <p>很高兴认识您。</p>
        </div>
        <div className={style.posts}>
          <p>- 历史博文</p>
          {allPostsData.map(({ id, date, title }) => (
            <div key={id} className={style.post}>
              <Link href={`/posts/${id}`}>
                <span>{title}</span>
              </Link>
              <br />
              <small>
                <Date dateString={date} />
              </small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default homePage;
