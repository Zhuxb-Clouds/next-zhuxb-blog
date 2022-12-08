import style from "./posts.module.css";
import Link from "next/link";
import Date from "../date";

export interface postsData {
  postsData: {
    date: string;
    title: string;
    id: string;
  }[];
}

const posts = ({ postsData }: postsData) => {
  return (
    <div>
      {postsData.map(({ id, date, title }) => (
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
  );
};
export default posts;
