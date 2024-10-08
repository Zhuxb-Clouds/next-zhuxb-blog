import type { GetStaticProps, GetStaticPaths } from "next";
import Head from "next/head";

import { getAllPostParams, getPostData } from "../../utils/posts";

import Tag from "../../components/tag";
import Date from "../../components/date";
// 引入代码高亮css
import { MDXRemote, MDXRemoteProps } from "next-mdx-remote";
import "prismjs/themes/prism-okaidia.min.css";
import style from "./post.module.css";
interface Props {
  postData: {
    title: string;
    date: string;
    content: MDXRemoteProps;
    tags: string[];
  };
}

export default function Post({ postData }: Props) {
  return (
    <div className="post">
      {" "}
      <Head>
        <title>{postData.title}</title>
      </Head>
      <h1 className={style.title}>{postData.title}</h1>
      <div className={style.tags}>
        {postData.tags.map((item) => (
          <Tag tagName={item} key={item} />
        ))}
      </div>
      <Date date={postData.date} className={style.time} />
      <article className={style.content}>
        <MDXRemote {...postData.content} ></MDXRemote>
      </article>
    </div>
  );
}

// getStaticProps和getStaticPaths只在服务器端运行，永远不会在客户端运行
export const getStaticPaths: GetStaticPaths = async () => {
  // 获取所有文章id，即所有路由
  const paths = getAllPostParams();
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  // 获取文章内容

  const postData = await getPostData(params!.slug as string[]);
  return {
    props: {
      postData,
    },
  };
};
