import style from "./posts.module.css";
import Link from "next/link";
import Date from "../date";
import Tag from "../tag";

export interface postsData {
  postsData: {
    date: string;
    title: string;
    id: string;
    tags: string[];
    path: string;
  }[];
}

const posts = ({ postsData }: postsData) => {
  return (
    <div>
      {postsData.map(({ id, date, title, tags, path }) => {
        return (
          <div
            key={id}
            style={{
              position: "relative",
            }}
          >
            <Link href={`/posts/${path}`}>
              <div className={style.post}>
                <span className={style.title}>{title}</span>
                <br />
                <span className={style.date}>
                  <Date date={date} />
                </span>
              </div>
            </Link>
            <div className={style.tags}>
              {tags.map((tag, key) => (
                <Tag tagName={tag} key={key} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
export default posts;
