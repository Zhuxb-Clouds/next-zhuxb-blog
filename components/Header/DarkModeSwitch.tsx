import Image from "next/image";
import SunIcon from "../../public/sun.svg";
import MoonIcon from "../../public/moon.svg";
import styles from "./Header.module.css";
import React, { useState, useEffect } from "react";


function DarkModeSwitch() {
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
    <Image
      src={mode == "dark" ? SunIcon : MoonIcon}
      alt=""
      width={50}
      height={50}
      className={styles.svg}
      onClick={switchMode}
      style={{ fill: mode == "dark" ? "white" : "black" }}
    ></Image>
  );
}

export default DarkModeSwitch;
