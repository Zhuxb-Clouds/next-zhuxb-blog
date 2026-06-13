import type { GetStaticProps, GetStaticPaths } from "next";
import Head from "next/head";
import Link from "next/link";

import { getAllPostParams, getPostData } from "../../utils/posts";

import Tag from "../../components/tag";
import Date from "../../components/date";
import { MDXRemote, MDXRemoteProps } from "next-mdx-remote";
import style from "./post.module.css";
import { useTranslation } from "../../lib/i18n";
interface Props {
  postData: {
    title: string;
    date: string;
    content: MDXRemoteProps;
    tags: string[];
  };
}


import React, { useState, useEffect, useRef, useCallback, ImgHTMLAttributes } from "react";
import Giscus from '@giscus/react';

function ImageWithFx(props: ImgHTMLAttributes<HTMLImageElement>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const stateRef = useRef({
    raf: 0,
    phase: "idle" as "idle" | "reveal" | "visible" | "hide",
    progress: 0,
    lastTime: 0,
    delayTimer: null as ReturnType<typeof setTimeout> | null,
    thresholds: null as Float32Array | null,
    startTime: 0,
    imgLoaded: false,
    visible: true,
    dpr: 1,
  });
  const [, forceUpdate] = useState(0);

  const CELL_CSS = 12;
  const GAP_CSS = 2;
  const REVEAL_MS = 1400;
  const HOLD_MS = 4000;
  const HIDE_MS = 600;
  const DELAY_MIN = 2000;
  const DELAY_MAX = 4000;
  const SOFT = 0.08;

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return false;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return false;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    stateRef.current.dpr = dpr;
    return true;
  }, []);

  const getGrid = useCallback((w: number, h: number, dpr: number) => {
    const cell = CELL_CSS * dpr;
    const gap = GAP_CSS * dpr;
    const cols = Math.max(2, Math.floor(w / cell));
    const rows = Math.max(2, Math.floor(h / cell));
    const ox = (w - cols * cell) * 0.5;
    const oy = (h - rows * cell) * 0.5;
    return { cols, rows, cell, gap, ox, oy };
  }, []);

  const genThresholds = useCallback((n: number) => {
    const a = new Float32Array(n);
    for (let i = 0; i < n; i++) a[i] = SOFT + Math.random() * (1 - 2 * SOFT);
    return a;
  }, []);

  const noiseRef = useRef<Float32Array | null>(null);

  const drawMosaic = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, t: number, dpr: number) => {
    const { cols, rows, cell, gap, ox, oy } = getGrid(w, h, dpr);
    const total = cols * rows;
    if (!noiseRef.current || noiseRef.current.length !== total) {
      noiseRef.current = new Float32Array(total);
      for (let i = 0; i < total; i++) noiseRef.current[i] = Math.random();
    }
    ctx.clearRect(0, 0, w, h);
    const s = t * 0.001;
    const bandPos = (s * 0.4) % 2.0;
    const bandWidth = 0.35;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const diag = (c / cols + r / rows);
        const dist = Math.abs(diag - bandPos);
        const highlight = Math.max(0, 1 - dist / bandWidth);
        const v = highlight * highlight;
        const base = 140 + noiseRef.current[r * cols + c] * 15;
        const g = Math.round(base + v * 100);
        ctx.fillStyle = `rgb(${g},${g},${g})`;
        const x = ox + c * cell + gap * 0.5;
        const y = oy + r * cell + gap * 0.5;
        ctx.fillRect(x, y, cell - gap, cell - gap);
      }
    }
  }, [getGrid]);

  const drawFrame = useCallback((ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number, fadeT: number, t: number, dpr: number) => {
    const { cols, rows, cell, gap, ox, oy } = getGrid(w, h, dpr);
    const th = stateRef.current.thresholds;
    if (!th) return;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    const s = t * 0.001;
    const bandPos = (s * 0.4) % 2.0;
    const bandWidth = 0.35;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        const a = Math.max(0, Math.min(1, 0.5 + (th[idx] - fadeT) / (2 * SOFT)));
        if (a <= 0) continue;
        const diag = (c / cols + r / rows);
        const dist = Math.abs(diag - bandPos);
        const highlight = Math.max(0, 1 - dist / bandWidth);
        const v = highlight * highlight;
        const base = 140 + (noiseRef.current ? noiseRef.current[idx] * 15 : 0);
        const g = Math.round(base + v * 100);
        ctx.globalAlpha = a;
        ctx.fillStyle = `rgb(${g},${g},${g})`;
        const x = ox + c * cell + gap * 0.5;
        const y = oy + r * cell + gap * 0.5;
        ctx.fillRect(x, y, cell - gap, cell - gap);
      }
    }
    ctx.globalAlpha = 1;
  }, [getGrid]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const obs = new IntersectionObserver(
      ([e]) => { stateRef.current.visible = e.isIntersecting; },
      { rootMargin: "100px" }
    );
    obs.observe(canvas);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!setupCanvas()) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const st = stateRef.current;
    const w = canvas.width, h = canvas.height;
    st.startTime = performance.now();
    st.phase = "idle";
    st.progress = 0;
    const { cols, rows } = getGrid(w, h, st.dpr);
    st.thresholds = genThresholds(cols * rows);
    let cancelled = false;

    function tick(now: number) {
      if (cancelled) return;
      if (!st.visible) { st.raf = requestAnimationFrame(tick); return; }
      const elapsed = now - st.startTime;
      const img = imgRef.current;

      if (st.phase === "idle") {
        drawMosaic(ctx, w, h, elapsed, st.dpr);
      } else if (st.phase === "reveal" && img) {
        const dt = now - st.lastTime;
        st.lastTime = now;
        st.progress += dt / REVEAL_MS;
        if (st.progress >= 1) {
          st.progress = 0;
          st.phase = "visible";
          st.lastTime = now;
          ctx.clearRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
        } else {
          const eased = 1 - Math.pow(1 - st.progress, 3);
          drawFrame(ctx, img, w, h, eased, elapsed, st.dpr);
        }
      } else if (st.phase === "visible" && img) {
        const dt = now - st.lastTime;
        st.lastTime = now;
        st.progress += dt / HOLD_MS;
        if (st.progress >= 1) {
          st.phase = "hide";
          st.progress = 0;
          st.lastTime = now;
        }
      } else if (st.phase === "hide" && img) {
        const dt = now - st.lastTime;
        st.lastTime = now;
        st.progress += dt / HIDE_MS;
        if (st.progress >= 1) {
          st.phase = "idle";
          st.progress = 0;
          const { cols: c2, rows: r2 } = getGrid(w, h, st.dpr);
          st.thresholds = genThresholds(c2 * r2);
          scheduleReveal();
        } else {
          const eased = Math.pow(st.progress, 2);
          drawFrame(ctx, img, w, h, 1 - eased, elapsed, st.dpr);
        }
      }
      st.raf = requestAnimationFrame(tick);
    }

    function scheduleReveal() {
      if (cancelled || !st.imgLoaded) return;
      const delay = DELAY_MIN + Math.random() * (DELAY_MAX - DELAY_MIN);
      st.delayTimer = setTimeout(() => {
        if (cancelled || !st.imgLoaded) return;
        st.phase = "reveal";
        st.progress = 0;
        st.lastTime = performance.now();
      }, delay);
    }

    st.raf = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(st.raf);
      if (st.delayTimer) clearTimeout(st.delayTimer);
    };
  }, [setupCanvas, getGrid, genThresholds, drawMosaic, drawFrame]);

  const handleLoad = useCallback(() => {
    const st = stateRef.current;
    st.imgLoaded = true;
    forceUpdate(n => n + 1);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { cols, rows } = getGrid(canvas.width, canvas.height, st.dpr);
    st.thresholds = genThresholds(cols * rows);
    const delay = DELAY_MIN + Math.random() * (DELAY_MAX - DELAY_MIN);
    st.delayTimer = setTimeout(() => {
      if (!st.imgLoaded) return;
      st.phase = "reveal";
      st.progress = 0;
      st.lastTime = performance.now();
    }, delay);
  }, [getGrid, genThresholds]);

  return (
    <div style={{ position: "relative", width: "100%", minHeight: 120, borderRadius: 14, border: "1px solid var(--border-color)", overflow: "hidden" }}>
      <img
        {...props}
        ref={imgRef}
        onLoad={handleLoad}
        style={{ width: "100%", display: "block", visibility: "hidden" }}
      />
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
      />
    </div>
  );
}
(ImageWithFx as any)._isImageFx = true;

function MdxParagraph(props: React.HTMLAttributes<HTMLParagraphElement>) {
  const children = React.Children.toArray(props.children);
  const hasImage = children.some((child) => {
    if (!React.isValidElement(child)) return false;
    if (child.type === "img" || child.type === ImageWithFx) return true;
    if (typeof child.type === "function" && (child.type as any)._isImageFx) return true;
    return false;
  });
  if (hasImage) {
    return <div {...props} style={{ textIndent: 0, textAlign: "center" }} />;
  }
  return <p {...props} />;
}

const mdxComponents = {
  img: ImageWithFx,
  p: MdxParagraph,
};

function GiscusComponent() {
  const [mode, setMode] = useState("preferred_color_scheme");

  useEffect(() => {
    setMode(
      document.documentElement.getAttribute("data-theme") ||
        localStorage.getItem("mode") ||
        "preferred_color_scheme"
    );
  }, []);

  return (
    <Giscus
      id="comments"
      repo="Zhuxb-Clouds/next-zhuxb-blog"
      repoId="R_kgDOIk9Wow"
      category="Ideas"
      categoryId="DIC_kwDOIk9Wo84CuCQr"
      mapping="title"
      strict="0"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="bottom"
      theme={mode}
      lang="zh-CN"
      loading="lazy"
    />
  );
}

export default function Post({ postData }: Props) {
  const { t } = useTranslation();
  return (
    <div className="post">
      <Head>
        <title>{postData.title}</title>
      </Head>
      <h1 className={style.title}>{postData.title}</h1>
      <span
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div className={style.tags}>
          {postData.tags.map((item) => (
            <Tag tagName={item} key={item} />
          ))}
        </div>
        <Date date={postData.date} className={style.time} />
      </span>
      <article className={style.content}>
        <MDXRemote {...postData.content} components={mdxComponents} />
      </article>
      <p style={{ textAlign: "center", margin: "2rem 0 1rem" }}>
        <Link href="/donate" style={{ fontSize: "14px", color: "var(--secondary-text-color, #999)" }}>
          ☕ {t("donate.title")}
        </Link>
      </p>
      <div className={style.giscus}>
        <GiscusComponent />
      </div>
    </div>
  );
}

// getStaticProps和getStaticPaths只在服务器端运行，永远不会在客户端运行
export const getStaticPaths: GetStaticPaths = async () => {
  // 获取所有文章id，即所有路由
  const paths = getAllPostParams();
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  // 获取文章内容

  const postData = await getPostData(params!.slug as string[]);
  return {
    props: {
      postData,
    },
  };
};
