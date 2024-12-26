import Header from "../Header";
import Footer from "../Footer";
import styles from "./layout.module.css";
import * as React from "react";
import { useRouter } from 'next/router';

function Layout({ children }: any) {
  const router = useRouter();
  const currentUrl = `${router.asPath}`;
  return (
    <div className={styles.container}>
      {currentUrl == "/" ? <div /> : <Header />}
      <div className={styles.body}>
        <div className={styles.content}>{children}</div>
      </div>
      <Footer />
    </div>
  );
}

export default Layout;
