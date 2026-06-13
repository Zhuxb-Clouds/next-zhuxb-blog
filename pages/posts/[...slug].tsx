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
    phase: "idle" as "idle" | "reveal" | "visible",
    progress: 0,
    lastTime: 0,
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

  const snoise = useCallback((x: number, y: number) => {
    const F2 = 0.5 * (Math.sqrt(3) - 1);
    const G2 = (3 - Math.sqrt(3)) / 6;
    const s = (x + y) * F2;
    const i = Math.floor(x + s);
    const j = Math.floor(y + s);
    const t = (i + j) * G2;
    const X0 = i - t, Y0 = j - t;
    const x0 = x - X0, y0 = y - Y0;
    const i1 = x0 > y0 ? 1 : 0;
    const j1 = x0 > y0 ? 0 : 1;
    const x1 = x0 - i1 + G2, y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2, y2 = y0 - 1 + 2 * G2;
    const grad3 = [[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]];
    const perm = (n: number) => {
      const v = ((n * 1597 + 51749) * 244153) & 0x7fffffff;
      return v;
    };
    const dot2 = (g: number[], ax: number, ay: number) => g[0] * ax + g[1] * ay;
    const ii = i & 255, jj = j & 255;
    const gi0 = perm(ii + perm(jj)) % 8;
    const gi1 = perm(ii + i1 + perm(jj + j1)) % 8;
    const gi2 = perm(ii + 1 + perm(jj + 1)) % 8;
    let n0 = 0, n1 = 0, n2 = 0;
    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 > 0) { t0 *= t0; n0 = t0 * t0 * dot2(grad3[gi0], x0, y0); }
    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 > 0) { t1 *= t1; n1 = t1 * t1 * dot2(grad3[gi1], x1, y1); }
    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 > 0) { t2 *= t2; n2 = t2 * t2 * dot2(grad3[gi2], x2, y2); }
    return 70 * (n0 + n1 + n2);
  }, []);

  const fbm = useCallback((x: number, y: number, octaves: number) => {
    let val = 0, amp = 0.5;
    let px = x, py = y;
    for (let i = 0; i < octaves; i++) {
      val += amp * snoise(px, py);
      px *= 2; py *= 2;
      amp *= 0.5;
    }
    return val;
  }, [snoise]);

  const isDark = useCallback(() => {
    return document.documentElement.getAttribute("data-theme") === "dark";
  }, []);

  const getBaseColors = useCallback((): { bg: [number, number, number]; fg: [number, number, number] } => {
    if (isDark()) {
      return { bg: [0, 0, 0], fg: [17, 17, 17] };
    }
    return { bg: [255, 255, 255], fg: [238, 238, 238] };
  }, [isDark]);

  const getCellColor = useCallback((cx: number, cy: number, time: number): [number, number, number] => {
    const { bg, fg } = getBaseColors();
    const scale = 0.8;
    const px = cx * scale, py = cy * scale;
    const t = time * 0.6;
    const wx = fbm(px * 0.7 + t * 0.12, py * 0.7 + t * 0.08, 3) * 1.6;
    const wy = fbm(px * 0.7 + 3.3 + t * 0.09, py * 0.7 + 7.7 - t * 0.11, 3) * 1.6;
    const n = fbm(px + wx + t * 0.06, py + wy + t * 0.05, 3) * 0.5 + 0.5;
    const r = Math.round(bg[0] + (fg[0] - bg[0]) * n);
    const g = Math.round(bg[1] + (fg[1] - bg[1]) * n);
    const b = Math.round(bg[2] + (fg[2] - bg[2]) * n);
    return [r, g, b];
  }, [fbm, getBaseColors]);

  const drawMosaic = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, t: number, dpr: number) => {
    const { cols, rows, cell, gap, ox, oy } = getGrid(w, h, dpr);
    const { bg } = getBaseColors();
    ctx.clearRect(0, 0, w, h);
    const time = t * 0.001;
    const vigW = w / dpr, vigH = h / dpr;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const nx = c / cols, ny = r / rows;
        const [cr, cg, cb] = getCellColor(nx * 3, ny * 3, time);
        const edgeX = Math.min(nx, 1 - nx) * vigW * 0.5;
        const edgeY = Math.min(ny, 1 - ny) * vigH * 0.5;
        const edgeDist = Math.min(edgeX, edgeY);
        const vigRange = 35;
        const vig = Math.min(1, (edgeDist * edgeDist) / (vigRange * vigRange));
        const vr = Math.round(bg[0] + (cr - bg[0]) * vig);
        const vg = Math.round(bg[1] + (cg - bg[1]) * vig);
        const vb = Math.round(bg[2] + (cb - bg[2]) * vig);
        ctx.fillStyle = `rgb(${vr},${vg},${vb})`;
        const x = ox + c * cell + gap * 0.5;
        const y = oy + r * cell + gap * 0.5;
        ctx.fillRect(x, y, cell - gap, cell - gap);
      }
    }
  }, [getGrid, getCellColor, getBaseColors]);

  const drawFrame = useCallback((ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number, fadeT: number, t: number, dpr: number) => {
    const { cols, rows, cell, gap, ox, oy } = getGrid(w, h, dpr);
    const { bg } = getBaseColors();
    const th = stateRef.current.thresholds;
    if (!th) return;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    const time = t * 0.001;
    const vigW = w / dpr, vigH = h / dpr;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        const a = Math.max(0, Math.min(1, 0.5 + (th[idx] - fadeT) / (2 * SOFT)));
        if (a <= 0) continue;
        const nx = c / cols, ny = r / rows;
        const [cr, cg, cb] = getCellColor(nx * 3, ny * 3, time);
        const edgeX = Math.min(nx, 1 - nx) * vigW * 0.5;
        const edgeY = Math.min(ny, 1 - ny) * vigH * 0.5;
        const edgeDist = Math.min(edgeX, edgeY);
        const vigRange = 35;
        const vig = Math.min(1, (edgeDist * edgeDist) / (vigRange * vigRange));
        const vr = Math.round(bg[0] + (cr - bg[0]) * vig);
        const vg = Math.round(bg[1] + (cg - bg[1]) * vig);
        const vb = Math.round(bg[2] + (cb - bg[2]) * vig);
        ctx.globalAlpha = a;
        ctx.fillStyle = `rgb(${vr},${vg},${vb})`;
        const x = ox + c * cell + gap * 0.5;
        const y = oy + r * cell + gap * 0.5;
        ctx.fillRect(x, y, cell - gap, cell - gap);
      }
    }
    ctx.globalAlpha = 1;
  }, [getGrid, getCellColor, getBaseColors]);

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
    const canvas = canvasRef.current;
    if (!canvas) return;
    setupCanvas();
    const ctx = canvas.getContext("2d")!;
    const st = stateRef.current;
    st.startTime = performance.now();
    st.phase = "idle";
    st.progress = 0;
    const { cols, rows } = getGrid(canvas.width, canvas.height, st.dpr);
    st.thresholds = genThresholds(cols * rows);
    let cancelled = false;

    const ro = new ResizeObserver(() => {
      if (cancelled) return;
      setupCanvas();
      const { cols: c, rows: r } = getGrid(canvas.width, canvas.height, st.dpr);
      if (!st.thresholds || st.thresholds.length !== c * r) {
        st.thresholds = genThresholds(c * r);
      }
    });
    ro.observe(canvas);

    function tick(now: number) {
      if (cancelled) return;
      if (!st.visible) { st.raf = requestAnimationFrame(tick); return; }
      const w = canvas!.width, h = canvas!.height;
      if (w === 0 || h === 0) { st.raf = requestAnimationFrame(tick); return; }
      const elapsed = now - st.startTime;
      const img = imgRef.current;

      if (st.phase === "idle") {
        drawMosaic(ctx, w, h, elapsed, st.dpr);
      } else if (st.phase === "reveal" && img) {
        const dt = now - st.lastTime;
        st.lastTime = now;
        st.progress += dt / REVEAL_MS;
        if (st.progress >= 1) {
          st.phase = "visible";
          ctx.clearRect(0, 0, w, h);
          canvas!.style.display = "none";
          return;
        } else {
          const eased = 1 - Math.pow(1 - st.progress, 3);
          drawFrame(ctx, img, w, h, eased, elapsed, st.dpr);
        }
      }
      st.raf = requestAnimationFrame(tick);
    }


    st.raf = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(st.raf);
      ro.disconnect();
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
    st.phase = "reveal";
    st.progress = 0;
    st.lastTime = performance.now();
  }, [getGrid, genThresholds]);

  return (
    <div style={{ position: "relative", width: "100%", minHeight: stateRef.current.imgLoaded ? 0 : 120, borderRadius: 14, border: "1px solid var(--border-color)", overflow: "hidden", transition: "min-height 0.3s ease" }}>
      <img
        {...props}
        ref={imgRef}
        onLoad={handleLoad}
        style={{ width: "100%", display: "block", visibility: stateRef.current.imgLoaded ? "visible" : "hidden" }}
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
