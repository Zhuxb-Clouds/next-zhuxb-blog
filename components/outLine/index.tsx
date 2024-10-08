
import Link from "next/link";
interface Props {
  tagName: string;
}

export default function Tag({ tagName }: Props) {
  return (
    <div className="tag">
      <Link href={``}>
        <span>{tagName}</span>
      </Link>
    </div>
  );
}
