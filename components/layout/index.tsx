import Header from "../Header";
import styles from "./layout.module.css";
import * as React from "react";

function layout(props: any) {
  return (
    <div className={styles.container}>
      <div className={styles.body}>
        <div className={styles.header}>
          <Header />
        </div>
        <div className={styles.content}>{props.children}</div>
      </div>
    </div>
  );
}

export default layout;
