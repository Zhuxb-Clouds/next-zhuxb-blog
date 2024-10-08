import { parseISO, format } from "date-fns";

interface Props {
  date: string;
  className?: string;
}

export default function Date({ date, className }: Props) {
  return (
    <time dateTime={date} className={className}>
      {format(parseISO(date), "yyyy年MM月dd日")}
    </time>
  );
}
