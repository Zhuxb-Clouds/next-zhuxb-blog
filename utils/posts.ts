import fs from "fs";
import path from "path";
// gray-matter：获取元数据
import matter from "gray-matter";
// date-fns：处理日期
import { parseISO, format } from "date-fns";
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
  data: { date: string; tags: string[] };
  content: string;
  [key: string]: unknown;
}

// posts目录的路径
const postsDirectory = path.join(process.cwd(), "posts");

function getAllFiles(directory: string): { name: string, path: string }[] {
  const files = fs.readdirSync(directory);
  let result: { name: string, path: string }[] = [];

  files.forEach((file) => {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // 递归调用以处理子目录中的文件
      result = result.concat(getAllFiles(fullPath));
    } else {
      // 获取相对路径作为 path
      const relativePath = path.relative(directory, fullPath);
      result.push({
        name: file.replace(/\.md$/, ""), // 去掉 `.md` 扩展名
        path: relativePath,
      });
    }
  });
  return result;
}
const fileNames: {
  name: string;
  path: string;
}[] = getAllFiles(postsDirectory);
const postsMap = new Map();
getAllPostParams();

// 获取所有文章用于展示首页列表的数据
export function getSortedPostsData(): Array<{
  id: string;
  date: string;
  title: string;
  tags: string[];
  path: string;
}> {
  // 获取所有md文件用于展示首页列表的数据，包含id，元数据（标题，时间）
  const allPostsData = fileNames.map(({ name: fileName }) => {
    // 去除文件名的md后缀，使其作为文章id使用
    const id = getUuid(fileName);

    // 获取md文件路径
    const fullPath = path.join(postsDirectory, `${fileName}.md`);

    // 读取md文件内容
    const fileContents = fs.readFileSync(fullPath, "utf8");

    // 使用matter提取md文件元数据：{data:{//元数据},content:'内容'}
    const matterResult = matter(fileContents);
    return {
      id,
      date: format(matterResult.data.date, "yyyy年MM月dd日"),
      title: fileName,
      tags: matterResult.data.tags,
      path: getPathById(id),
    };
  });
  // 按照日期从进到远排序
  return allPostsData.sort(({ date: a }, { date: b }) =>
    // parseISO：字符串转日期
    parseISO(a) < parseISO(b) ? 1 : -1
  );
}

export function getUuid(fileName: string): string {
  const fileNameStr = fileName;
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
export function getAllPostParams(): {
  params: {
    id: string;
    name: string;
    slug: string[];
  }
}[] {
  return fileNames.map(({ name, path }) => {
    return {
      params: {
        // 将文件名hash生成数字作为id
        id: getUuid(name),
        name,
        slug: path.replace(/\.md$/, "").split("\\").filter(Boolean),
      },
    };
  });
}

// 获取指定文章内容
export async function getPostData(slug: string[]) {
  const fullPath = path.join(postsDirectory, slug.join("/") + ".md");
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
    title: slug.at(-1),
    date: format(matterResult.data.date, "yyyy年MM月dd日"),
    tags: matterResult.data.tags,
  };
}

// 按条件查询文章
export function getPostsByCondition(condition: { tags?: string[]; keyWord?: string }) {
  const { tags, keyWord } = condition;
  const allPostsData = getSortedPostsData();
  const filterPostsData = allPostsData.filter((item) => {
    if (tags && tags.length > 0) {
      return tags.some((tag) => item.tags.includes(tag));
    }
    if (keyWord) {
      return item.title.includes(keyWord);
    }
    return true;
  });
  return filterPostsData;
}

function getPathById(id: string) {
  return fileNames.find(({ name }) => getUuid(name) === id)?.path.replace(".md", "") || "";
}
