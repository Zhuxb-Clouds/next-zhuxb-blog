import styles from "./Header.module.css";
import Link from "next/link";
import Image from "next/image";
import React, { useState } from "react";

import SunIcon from "../../public/sun.svg";
import MoonIcon from "../../public/moon.svg";

function Header() {
  const [dark, setDark] = useState(false);
  const switchMode = () => {
    if (!dark) {
      setDark(true);
    } else {
      setDark(false);
    }
  };
  return (
    <div className={styles.header}>
      <div className={styles.title}>
        <span>
          <Link href="/">Zhuxb&apos;s Blog</Link>
          <Image
            src={dark ? SunIcon : MoonIcon}
            alt=""
            width={50}
            height={50}
            className={styles.svg}
            onClick={switchMode}
          ></Image>
        </span>
        {/* <img src="" alt=""> */}
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
    </div>
  );
}

export default Header;
