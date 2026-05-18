// import PostList from "../../components/postList";
import { getSortedPostsData } from "../../utils/posts";
import Head from "next/head";
import type { NextPage } from "next";
import PostList, { postsData } from "../../components/postList";
import { useTranslation } from "../../lib/i18n";

const posts: NextPage<postsData> = ({ postsData }) => {
  const { t } = useTranslation();
  return (
    <div>
      <Head>
        <title>{t("posts.allPosts")} - Zhuxb&apos;s Blog</title>
      </Head>
      <p>{t("posts.allPosts")}</p>
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
