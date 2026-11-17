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
        <div className={styles.titleContent}>
          <Link className={styles.titleLink} href="/">
            {t("header.title")}
          </Link>
          <div className={styles.controls}>
            <DarkModeSwitch />
            <LanguageSwitch />
          </div>
        </div>
      </div>
      <nav className={styles.nav}>
        <Link href="/about">{t("header.about")}</Link>
      </nav>
    </header>
  );
}

export default Header;
