import { parseISO, format } from "date-fns";

interface Props {
  dateString: string;
}

export default function Date({ dateString }: Props) {
  const date = parseISO(dateString);
  return (
    <time dateTime={dateString} className="text-gray-500">
      {format(date, "yyyy年MM月dd日")}
    </time>
  );
}
