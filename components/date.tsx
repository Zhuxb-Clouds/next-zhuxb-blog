import { parseISO, format } from "date-fns";

interface Props {
  dateString: string;
  className?: string;
}

export default function Date({ dateString,className }: Props) {
  const date = parseISO(dateString);
  return (
    <time dateTime={dateString} className={className}>
      {format(date, "yyyy年MM月dd日")}
    </time>
  );
}
