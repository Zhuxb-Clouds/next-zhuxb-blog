import styles from "./Header.module.css";
import Link from "next/link";
import Image from "next/image";
import React, { useState } from "react";

import SunIcon from "../../public/sun.svg";
import MoonIcon from "../../public/moon.svg";

import { useSelector, useDispatch } from "react-redux";
import { setDark, setLight } from "../../store/darkSlice";

function Header() {
  const { value: mode } = useSelector((store: any) => store.dark);
  const dispatch = useDispatch();
  const switchMode = () => {
    console.log("dark", mode);
    mode == "dark" ? dispatch(setLight()) : dispatch(setDark());
  };
  return (
    <div className={styles.header}>
      <div className={styles.title}>
        <span>
          <Link href="/">Zhuxb&apos;s Blog</Link>
          <Image
            src={mode != "dark" ? SunIcon : MoonIcon}
            alt=""
            width={50}
            height={50}
            className={styles.svg}
            onClick={switchMode}
          ></Image>
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
    </div>
  );
}

export default Header;
