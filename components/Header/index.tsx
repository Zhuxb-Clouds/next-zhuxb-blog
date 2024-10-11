import styles from "./Header.module.css";
import Link from "next/link";
import React, { useState } from "react";
import Image from "next/image";
import SunIcon from "../../public/sun.svg";
import MoonIcon from "../../public/moon.svg";
import { useEffect } from "react";

function Header() {
  const [mode, setMode] = useState("dark");
  useEffect(() => {
    setMode(
      document.documentElement.getAttribute("data-theme") || localStorage.getItem("mode") || "dark"
    );
  }, []);
  const switchMode = () => {
    const newMode = mode == "dark" ? "light" : "dark";
    setMode(newMode);
    localStorage.setItem("mode", newMode);
    document.documentElement.setAttribute("data-theme", newMode);
  };
  return (
    <header className={styles.header}>
      <div className={styles.title}>
        <span>
          <Link href="/">Zhuxb&apos;s Blog</Link>
          <Image
            src={mode == "dark" ? SunIcon : MoonIcon}
            alt=""
            width={50}
            height={50}
            className={styles.svg}
            onClick={switchMode}
            style={{ fill: mode == "dark" ? "white" : "black" }}
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
    </header>
  );
}

export default Header;
