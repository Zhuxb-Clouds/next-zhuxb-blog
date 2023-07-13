import colorList from "./tagColorList.json";
import Link from "next/link";
interface Props {
  tagName: string;
}

export default function Tag({ tagName }: Props) {
  const color = colorList[tagName.trim() as keyof typeof colorList] ?? "#545454";
  return (
    <div>
      <Link href={`/posts/tags/${tagName.trim()}`}>
        <span>{tagName}</span>
      </Link>

      <style jsx>{`
        div {
          background: ${color};
          border-radius: 10px;
          padding: 3px 5px;
          color: #fff;
          margin: 0 10px 0 0;
          user-select: none;
          cursor: pointer;
          // transform: translateY(-50%);
        }
        span {
          padding: 2px;
        }
      `}</style>
    </div>
  );
}
