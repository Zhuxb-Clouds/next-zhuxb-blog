import colorList from "./tagColorList.json";
interface Props {
  tagName: string;
}

export default function Tag({ tagName }: Props) {
  const color = colorList[tagName.trim() as keyof typeof colorList];
  return (
    <div>
      {tagName}
      <style jsx>{`
        div {
          background: ${color};
          border-radius: 10px;
          padding: 0px 5px;
          color: #fff;
          margin: 0 10px 0 0;
        }
      `}</style>
    </div>
  );
}
