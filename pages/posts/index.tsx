// import PostList from "../../components/postList";
import { getSortedPostsData } from "../../utils/posts";
import Head from "next/head";
import type { NextPage } from "next";
import PostList, { postsData } from "../../components/postList";

const posts: NextPage<postsData> = ({ postsData }) => {
  return (
    <div>
      <Head>
        <title>Post - Zhuxb&apos; Blog</title>
      </Head>
      <p>所有文章</p>
      <PostList postsData={postsData} />
    </div>
  );
};
export default posts;

export async function getStaticProps() {
  const postsData = getSortedPostsData();
  return {
    props: {
      postsData,
    },
  };
}
