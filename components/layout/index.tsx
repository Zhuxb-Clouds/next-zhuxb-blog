import Header from "../Header";
import Footer from "../Footer";
import styles from "./layout.module.css";
import * as React from "react";

function layout({ children }: any) {
  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.body}>
        <div className={styles.content}>{children}</div>
      </div>
      <Footer />
    </div>
  );
}

export default layout;
