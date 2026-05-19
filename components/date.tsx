import { parseISO, format } from "date-fns";
import { zhCN, enUS } from "date-fns/locale";
import { useTranslation } from "../lib/i18n";

interface Props {
  date: string;
  className?: string;
}

const localeMap = { zh: zhCN, en: enUS };
const formatMap = { zh: "yyyy年MM月dd日", en: "MMMM d, yyyy" };

export default function Date({ date, className }: Props) {
  const { locale } = useTranslation();
  return (
    <time dateTime={date} className={className}>
      {format(parseISO(date), formatMap[locale], { locale: localeMap[locale] })}
    </time>
  );
}
