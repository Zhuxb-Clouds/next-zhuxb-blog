import Head from "next/head";
import Image from "next/image";
import style from "../styles/donate.module.css";
import { useTranslation } from "../lib/i18n";

export default function Donate() {
  const { t } = useTranslation();
  return (
    <div>
      <Head>
        <title>{t("donate.title")} - Zhuxb</title>
      </Head>
      <div className={style.container}>
        <h1 className={style.title}>{t("donate.title")}</h1>
        <p className={style.description}>{t("donate.description")}</p>
        <Image
          className={style.qrCode}
          src="/donate-qr.png"
          alt="donate QR code"
          width={240}
          height={240}
        />
        <p className={style.scanHint}>{t("donate.scan")}</p>
      </div>
    </div>
  );
}
