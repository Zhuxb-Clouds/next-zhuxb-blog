import Head from "next/head";
import Image from "next/image";
import style from "../styles/about.module.css";
import { useTranslation } from "../lib/i18n";

export default function About() {
  const { t } = useTranslation();

  return (
    <div>
      <Head>
        <title>{t("about.title")} - Zhuxb</title>
      </Head>
      <div className={style.container}>
        <div className={style.avatarContainer}>
          <Image
            src="https://oss.hrsrive.cn/avatar.png"
            alt="avatar"
            width={120}
            height={120}
            objectFit="cover"
          />
        </div>
        <h1 className={style.name}>{t("about.name")}</h1>
        <p className={style.roles}>
          {t("about.role1")} · {t("about.role2")}
        </p>
        <p className={style.groups}>
          {t("about.group1")} / {t("about.group2")}
        </p>

        <section className={style.contactSection}>
          <h2 className={style.contactTitle}>{t("about.collaboration")}</h2>
          <p className={style.collaborationDescription}>{t("about.collaborationDescription")}</p>
        </section>

        <div className={style.contactSection}>
          <h2 className={style.contactTitle}>{t("about.contact")}</h2>
          <div className={style.contactList}>
            <a className={style.contactItem} href="tel:15259939593">
              <span className={style.contactLabel}>📱 {t("about.mobile")}</span>
              <span className={style.contactValue}>15259939593</span>
            </a>
            <a
              className={style.contactItem}
              href="mailto:ZhuxbClouds@gmail.com"
            >
              <span className={style.contactLabel}>✉️ {t("about.email")}</span>
              <span className={style.contactValue}>ZhuxbClouds@gmail.com</span>
            </a>
            <a
              className={style.contactItem}
              href="https://hrsrive.cn/"
              target="_blank"
              rel="noreferrer"
            >
              <span className={style.contactLabel}>
                🌐 {t("about.website1")}
              </span>
              <span className={style.contactValue}>hrsrive.cn</span>
            </a>
            <a
              className={style.contactItem}
              href="https://nivegame.huashuocard.cn/"
              target="_blank"
              rel="noreferrer"
            >
              <span className={style.contactLabel}>
                🌐 {t("about.website2")}
              </span>
              <span className={style.contactValue}>nivegame.huashuocard.cn</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
