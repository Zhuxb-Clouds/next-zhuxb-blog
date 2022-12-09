interface Props {
  tagName: string;
}

const colorList = {
  Vue: "#82b565",
  Vue2: "#42b883",
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
        }
      `}</style>
    </div>
  );
}
