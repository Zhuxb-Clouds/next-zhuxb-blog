import fs from "fs";
import path from "path";
// gray-matter：获取元数据
import matter from "gray-matter";
// date-fns：处理日期
import { parseISO } from "date-fns";
import { serialize } from "next-mdx-remote/serialize";
// remark-prism：markdown代码高亮
import prism from "remark-prism";
import gfm from "remark-gfm";

// remarkMath：markdown数学公式
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
// externalLinks：使markdown的链接是在新页面打开链接
import externalLinks from "remark-external-links";

interface MatterMark {
  data: { date: string; title: string };
  content: string;
  [key: string]: unknown;
}

// posts目录的路径
const postsDirectory = path.join(process.cwd(), "posts");
// 获取posts目录下的所有文件名（带后缀）
const fileNames = fs.readdirSync(postsDirectory);
const postsMap = new Map();
getAllPostIds();

// 获取所有文章用于展示首页列表的数据
export function getSortedPostsData() {
  // 获取所有md文件用于展示首页列表的数据，包含id，元数据（标题，时间）
  const allPostsData = fileNames.map((fileName) => {
    // 去除文件名的md后缀，使其作为文章id使用
    const id = getUuid(fileName);

    // 获取md文件路径
    const fullPath = path.join(postsDirectory, fileName);

    // 读取md文件内容
    const fileContents = fs.readFileSync(fullPath, "utf8");

    // 使用matter提取md文件元数据：{data:{//元数据},content:'内容'}
    const matterResult = matter(fileContents);

    return {
      id,
      ...(matterResult.data as MatterMark["data"]),
    };
  });

  // 按照日期从进到远排序
  return allPostsData.sort(({ date: a }, { date: b }) =>
    // parseISO：字符串转日期
    parseISO(a) < parseISO(b) ? 1 : -1
  );
}

export function getUuid(fileName: string): string {
  const fileNameStr = fileName.replace(/\.md$/, "");
  let hash = 0,
    i,
    chr;
  if (fileNameStr.length === 0) return "0";
  for (i = 0; i < fileNameStr.length; i++) {
    chr = fileNameStr.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  postsMap.set(Math.abs(hash).toString(), fileNameStr);
  return Math.abs(hash).toString();
}
// 获取格式化后的所有文章id（文件名）
export function getAllPostIds() {
  // 这是返回的格式:
  // [
  //   {
  //     params: {
  //       id: '......'
  //     }
  //   },
  //   {
  //     params: {
  //       id: '......'
  //     }
  //   }
  // ]

  return fileNames.map((fileName) => {
    return {
      params: {
        // 将文件名hash生成数字作为id
        id: getUuid(fileName),
        name: fileName.replace(/\.md$/, ""),
      },
    };
  });
}

// 获取指定文章内容
export async function getPostData(id: string) {
  const fileName = postsMap.get(id);
  // const fileName = getAllPostIds().find((item) => item.params.id === id).params.name;
  console.log("fileName", fileName, postsMap);
  // 文章路径
  const fullPath = path.join(postsDirectory, `${fileName}.md`);

  // 读取文章内容
  const fileContents = fs.readFileSync(fullPath, "utf8");

  // 使用matter解析markdown元数据和内容
  const matterResult = matter(fileContents);

  return {
    content: await serialize(matterResult.content, {
      mdxOptions: {
        remarkPlugins: [[remarkMath, {}], gfm, prism, externalLinks],
        rehypePlugins: [[rehypeKatex, { output: "html", colorIsTextColor: true }]],
      },
    }),
    ...(matterResult.data as MatterMark["data"]),
  };
}
