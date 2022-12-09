interface Props {
  tagName: string;
}

const colorList = {
  Vue: "#82b565",
  Vue2: "#42b883",
  Css: "#2e49d4",
  Engineered: "#b50b6e",
  KrKr: "#c4d620",
  Renpy: "#f5df59",
};

export default function Tag({ tagName }: Props) {
  return (
    <div>
      {tagName}
      <style jsx>{`
        div {
          background: ${colorList[tagName as keyof typeof colorList]};
          border-radius: 10px;
          padding: 0px 5px;
          color: #fff;
          margin: 0 10px 0 0;
        }
      `}</style>
    </div>
  );
}
