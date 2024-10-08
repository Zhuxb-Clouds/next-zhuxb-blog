import type { GetStaticProps, GetStaticPaths } from "next";
import { getPostsByCondition } from "../../../utils/posts";
import Head from "next/head";
import style from "./tag.module.css";
import PostList from "../../../components/postList";
import Tag from "../../../components/tag";

import tags from "../../../components/tag/tagColorList.json";
interface Props {
  postsData: {
    date: string;
    title: string;
    id: string;
    tags: string[];
    path: string;
  }[];
  tag: string;
}

export default function Post({ postsData, tag }: Props) {
  return (
    <div>
      {" "}
      <Head>
        <title>{tag}</title>
      </Head>
      <div className={style.title}>
        All Posts about
        <Tag tagName={tag} />
      </div>
      <PostList postsData={postsData} />
    </div>
  );
}

// getStaticProps和getStaticPaths只在服务器端运行，永远不会在客户端运行
export const getStaticPaths: GetStaticPaths = async () => {
  // 获取所有文章id，即所有路由
  const paths = Object.keys(tags).map((tag) => {
    return {
      params: {
        tag,
      },
    };
  });
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  // 获取所有tags内有当前tag的文章
  const postsData = await getPostsByCondition({ tags: [params!.tag as string] });

  return {
    props: {
      postsData,
      tag: params!.tag,
    },
  };
};
