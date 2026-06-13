import type { GetStaticProps, GetStaticPaths } from "next";
import Head from "next/head";
import Link from "next/link";

import { getAllPostParams, getPostData } from "../../utils/posts";

import Tag from "../../components/tag";
import Date from "../../components/date";
import { MDXRemote, MDXRemoteProps } from "next-mdx-remote";
import { ImageGeneration } from "img-fx";
import style from "./post.module.css";
import { useTranslation } from "../../lib/i18n";
interface Props {
  postData: {
    title: string;
    date: string;
    content: MDXRemoteProps;
    tags: string[];
  };
}


import React, { useState, useEffect, ImgHTMLAttributes } from "react";
import Giscus from '@giscus/react';

const mdxComponents = {
  img: (props: ImgHTMLAttributes<HTMLImageElement>) => (
    <ImageGeneration
      images={props.src ? [props.src] : []}
      autoReveal
      revealDelayRange={[2, 4]}
      revealHoldMs={3000}
    >
      <img {...props} />
    </ImageGeneration>
  ),
};

function GiscusComponent() {
  const [mode, setMode] = useState("preferred_color_scheme");

  useEffect(() => {
    setMode(
      document.documentElement.getAttribute("data-theme") ||
        localStorage.getItem("mode") ||
        "preferred_color_scheme"
    );
  }, []);

  return (
    <Giscus
      id="comments"
      repo="Zhuxb-Clouds/next-zhuxb-blog"
      repoId="R_kgDOIk9Wow"
      category="Ideas"
      categoryId="DIC_kwDOIk9Wo84CuCQr"
      mapping="title"
      strict="0"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="bottom"
      theme={mode}
      lang="zh-CN"
      loading="lazy"
    />
  );
}

export default function Post({ postData }: Props) {
  const { t } = useTranslation();
  return (
    <div className="post">
      <Head>
        <title>{postData.title}</title>
      </Head>
      <h1 className={style.title}>{postData.title}</h1>
      <span
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div className={style.tags}>
          {postData.tags.map((item) => (
            <Tag tagName={item} key={item} />
          ))}
        </div>
        <Date date={postData.date} className={style.time} />
      </span>
      <article className={style.content}>
        <MDXRemote {...postData.content} components={mdxComponents} />
      </article>
      <p style={{ textAlign: "center", margin: "2rem 0 1rem" }}>
        <Link href="/donate" style={{ fontSize: "14px", color: "var(--secondary-text-color, #999)" }}>
          ☕ {t("donate.title")}
        </Link>
      </p>
      <div className={style.giscus}>
        <GiscusComponent />
      </div>
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
