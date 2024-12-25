import style from "./posts.module.css";
import Link from "next/link";
import Date from "../date";
import Tag from "../tag";
import React from "react";

export interface postsData {
  postsData: {
    date: string;
    title: string;
    id: string;
    tags: string[];
    path: string;
  }[];
}
const ForwardedTag = React.forwardRef(Tag);

const posts = ({ postsData }: postsData) => {
  return (
    <div className={style.postListContainer}>
      {postsData.map(({ id, date, title, tags, path }) => {
        return (
          <div
            key={id}
            style={{
              position: "relative",
            }}
          >
            <Link href={`/posts/${path}`} passHref legacyBehavior>
              <div className={style.post}>
                <span className={style.title}>{title}</span>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div className={style.tags}>
                    {tags.map((tag, key) => {
                      return <ForwardedTag key={key} tagName={tag} />;
                    })}
                  </div>
                  <span className={style.date}>
                    <Date date={date} />
                  </span>
                </div>
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
};
export default posts;
