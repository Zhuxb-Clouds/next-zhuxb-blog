import styles from "./Header.module.css";
import Link from "next/link";
import React, { useState } from "react";

function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.title}>
        <span>
          <Link href="/">Zhuxb&apos;s Blog</Link>
        </span>
      </div>
      <div className={styles.menu}>
        <span>
          <Link href="/about">About</Link>
        </span>
        <span>
          <Link href="/posts">Posts</Link>
        </span>
        <span>
          <a target="view_window" href="https://github.com/Zhuxb-Clouds">
            Github
          </a>
        </span>
      </div>
    </header>
  );
}

export default Header;
