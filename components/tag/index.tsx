import colorList from "./tagColorList.json";
import Link from "next/link";
interface Props {
  tagName: string;
}

export default function Tag({ tagName }: Props) {
  const color = colorList[tagName.trim() as keyof typeof colorList] ?? "#545454";
  return (
    <div className="tag">
      <Link href={`/posts/tags/${tagName}`} >
        <span>{tagName}</span>
      </Link>

      <style jsx>
        {`
          .tag {
            width: fit-content;
            height: auto;
            background: ${color};
            border-radius: 10px;
            padding: 3px 5px;
            color: #fff;
            margin: 0 10px 0 0;
            user-select: none;
            cursor: pointer;
            span{
              display: flex;
              align-items: center;
              font-family: "Smiley Sans";
            }
            
          }
          .tag span:hover {
            color: #fff;
          }
          span {
            padding: 2px;
          }
        `}
      </style>
    </div>
  );
}
