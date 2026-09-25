// 校验文章 frontmatter 的每个 tag 在 components/tag/tagColorList.json 中都有对应颜色，
// 缺失时以非零码退出，使 build/export 失败。
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const projectRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const postsDirectory = path.join(projectRoot, "posts");
const colorListPath = path.join(projectRoot, "components", "tag", "tagColorList.json");

function getAllMarkdownFiles(directory) {
  const result = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      result.push(...getAllMarkdownFiles(fullPath));
    } else if (entry.name.endsWith(".md")) {
      result.push(fullPath);
    }
  }
  return result;
}

const colorList = JSON.parse(fs.readFileSync(colorListPath, "utf8"));
const tagsWithoutColor = new Map();

for (const filePath of getAllMarkdownFiles(postsDirectory)) {
  const { data } = matter(fs.readFileSync(filePath, "utf8"));
  const tags = Array.isArray(data.tags) ? data.tags : [];
  for (const rawTag of tags) {
    if (typeof rawTag !== "string") continue;
    const tag = rawTag.trim();
    if (tag && !(tag in colorList) && !tagsWithoutColor.has(tag)) {
      tagsWithoutColor.set(tag, path.relative(projectRoot, filePath));
    }
  }
}

if (tagsWithoutColor.size > 0) {
  console.error("\n[check:tags] 以下 tag 在 components/tag/tagColorList.json 中缺少颜色条目：");
  for (const [tag, file] of tagsWithoutColor) {
    console.error(`  - "${tag}"（首次出现于 ${file}）`);
  }
  console.error("请先为其补充颜色再构建。");
  process.exit(1);
}

console.log("[check:tags] 所有 tag 均已有对应颜色。");
