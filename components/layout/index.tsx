import Header from "../Header";
import styles from "./layout.module.css";
import * as React from "react";

function layout({ children }: any) {
  return (
    <div className={styles.container}>
      <div className={styles.body}>
        <div className={styles.header}>
          <Header />
        </div>
        <div className={styles.content}>{children}</div>
        {/* <div className={styles.footer}>
          <a href="https://beian.miit.gov.cn/">鄂ICP备2022011304号-2</a>
        </div> */}
      </div>
    </div>
  );
}

export default layout;
