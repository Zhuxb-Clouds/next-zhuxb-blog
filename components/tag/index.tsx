"use client";

import colorList from "./tagColorList.json";
import Link from "next/link";
interface Props {
  tagName: string;
}

export default function Tag({ tagName }: Props) {
  const color = colorList[tagName.trim() as keyof typeof colorList] ?? "#545454";
  return (
    <div className="tag">
      <Link href={`/posts/tags/${tagName}`}>
        <span>{tagName}</span>
      </Link>

      <style jsx>
        {`
          .tag {
            width: fit-content;
            height: auto;
            background: ${color};
            border-radius: 20px;
            padding: 3px 10px;
            color: var(--bg-color);
            margin: 0 5px 0 0;
            user-select: none;
            cursor: pointer;
            opacity: 0.6;
            transition: 0.3s;
            span {
              display: flex;
              align-items: center;
              font-family: "Smiley Sans";
              font-size: 16px;
              transition: 0.1s;
            }
          }
          .tag:hover {
            opacity: 1;
          }
        `}
      </style>
    </div>
  );
}
