export default function Footer() {
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
        }}>© 2024 Zhuxb&apos;s blog</p>
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
