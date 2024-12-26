import styles from "./Header.module.css";
import Link from "next/link";
import React, { useState } from "react";
import DarkModeSwitch from "./DarkModeSwitch";

function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.title}>
        <span>
          <Link href="/">Zhuxb&apos;s Blog</Link>
          <DarkModeSwitch />
        </span>
      </div>
    </header>
  );
}

export default Header;
