import { parseISO, format } from "date-fns";

interface Props {
  date: string;
  className?: string;
}

export default function Date({ date, className }: Props) {
  return (
    <time dateTime={date} className={className}>
      {date}
    </time>
  );
}
