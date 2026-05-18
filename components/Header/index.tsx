import styles from "./Header.module.css";
import Link from "next/link";
import DarkModeSwitch from "./DarkModeSwitch";
import LanguageSwitch from "./LanguageSwitch";
import { useTranslation } from "../../lib/i18n";

function Header() {
  const { t } = useTranslation();
  return (
    <header className={styles.header}>
      <div className={styles.title}>
        <span>
          <Link href="/">{t("header.title")}</Link>
          <DarkModeSwitch />
          <LanguageSwitch />
        </span>
      </div>
    </header>
  );
}

export default Header;
