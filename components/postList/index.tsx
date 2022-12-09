import style from "./posts.module.css";
import Link from "next/link";
import Date from "../date";
import Tag from "../tag";

export interface postsData {
  postsData: {
    date: string;
    title: string;
    id: string;
    tag: string;
  }[];
}

const posts = ({ postsData }: postsData) => {
  return (
    <div>
      {postsData.map(({ id, date, title, tag }) => (
        <div key={id} className={style.post}>
          <Link href={`/posts/${id}`}>
            <span>{title}</span>
          </Link>
          <br />
          <span className={style.span}>
            <div className={style.tags}>
              {tag.split(",").map((tag, key) => (
                <Tag tagName={tag} key={key} />
              ))}
            </div>
            <Date dateString={date} />
          </span>
        </div>
      ))}
    </div>
  );
};
export default posts;
