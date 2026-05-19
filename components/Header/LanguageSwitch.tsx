import { useTranslation } from "../../lib/i18n";
import styles from "./Header.module.css";

export default function LanguageSwitch() {
  const { locale, setLocale } = useTranslation();

  const toggle = () => {
    setLocale(locale === "zh" ? "en" : "zh");
  };

  return (
    <button onClick={toggle} className={styles.langSwitch} aria-label="Switch language">
      {locale === "zh" ? "EN" : "中"}
    </button>
  );
}
