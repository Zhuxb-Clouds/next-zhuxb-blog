import Head from "next/head";
import Image from "next/image";
import style from "../styles/donate.module.css";
import { useTranslation } from "../lib/i18n";
import donations from "../data/donations.json";

interface RankItem {
  user: string;
  amount: number;
}

function getDonationRank(): RankItem[] {
  const map = new Map<string, number>();
  for (const d of donations) {
    map.set(d.user, (map.get(d.user) || 0) + d.amount);
  }
  return Array.from(map.entries())
    .map(([user, amount]) => ({ user, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);
}

export default function Donate() {
  const { t } = useTranslation();
  const rank = getDonationRank();

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

        <div className={style.rankSection}>
          <h2 className={style.rankTitle}>{t("donate.rankTitle")}</h2>
          <div className={style.rankList}>
            {rank.map((item, index) => (
              <div key={item.user} className={style.rankItem}>
                <span className={style.rankIndex}>
                  {index < 3 ? ["🥇", "🥈", "🥉"][index] : `#${index + 1}`}
                </span>
                <span className={style.rankUser}>{item.user}</span>
                <span className={style.rankAmount}>¥{item.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
