import { useTranslation } from "../../lib/i18n";

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer>
      <div
        style={{
          display: "flex",
          gap: "20px",

        }}
      >
        <p style={{
          fontSize: "12px",
        }}>{t("footer.copyright")}</p>
        <p style={{
          fontSize: "12px",
        }}>
          <a href="https://beian.miit.gov.cn" target="_blank" rel="noreferrer">
            鄂ICP备2022011304号-2
          </a>
        </p>
      </div>
    </footer>
  );
}
