import fs from "fs";
import { getSortedPostsData, getPostData } from "./posts";

export function generateFeedXML() {
    const postList = getSortedPostsData();
    const currentPostCount = postList.length;
    const feedCountFile = "./public/feedCount.json";
    const feedFile = "./public/feed.xml"

    // 检查是否存在 feedCount 文件
    let previousPostCount = 0;
    if (fs.existsSync(feedCountFile)) {
        const feedCountData = JSON.parse(fs.readFileSync(feedCountFile, "utf-8"));
        previousPostCount = feedCountData.postCount || 0;
    }

    // 如果 posts 数量没有变化，跳过生成
    if (currentPostCount === previousPostCount && fs.existsSync(feedFile)) {
        console.log("No new posts detected. Skipping feed generation.");
        return;
    }

    const metaData = {
        title: "Zhuxb Blog",
        description: "Share Everything I know.",
        link: "https://www.zhuxb.dev/",
        lastBuildDate: new Date(),
        pubDate: new Date(),
    };

    const promise = Promise.all(postList.map((p) => getPostData([p.path])));
    promise.then((res) => {
        const itemData = postList.map((post, index) => ({
            title: post.title,
            description: "",
            link: `https://www.zhuxb.dev/posts/${post.path}`,
            guid: post.id,
            pubDate: new Date(post.date),
            content: res[index].rawCotent,
        }));

        fs.writeFileSync(feedFile, convertToXml(metaData, itemData));

        // 更新 feedCount 文件
        fs.writeFileSync(feedCountFile, JSON.stringify({ postCount: currentPostCount }, null, 2));
        console.log("Feed generated and feedCount updated.");
    });
}

interface MetaData {
    title: string;
    description: string;
    link: string;
    lastBuildDate: Date;
    pubDate: Date;
}

interface ItemData {
    title: string;
    description: string;
    link: string;
    guid: string;
    pubDate: Date;
}

function convertToXml(metaData: MetaData, itemData: ItemData[]): string {
    // Function to escape XML special characters
    function escapeXml(unsafe: string): string {
        return unsafe.replace(/[<>&'\"\\u0000-\\u001F]/g, (c) => {
            switch (c) {
                case "<":
                    return "&lt;";
                case ">":
                    return "&gt;";
                case "&":
                    return "&amp;";
                case "'":
                    return "&apos;";
                case '"':
                    return "&quot;";
                default:
                    return `&#${c.charCodeAt(0)};`;
            }
        });
    }

    // Start building XML string
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<rss version="2.0">\n`;
    xml += `  <channel>\n`;

    // Add metaData to the XML
    Object.entries(metaData).forEach(([key, value]) => {
        if (value instanceof Date) {
            value = value.toUTCString();
        }
        xml += `    <${key}>${escapeXml(value.toString())}</${key}>\n`;
    });

    // Add itemData to the XML
    itemData.forEach((item) => {
        xml += `    <item>\n`;
        Object.entries(item).forEach(([key, value]) => {
            if (value instanceof Date) {
                value = value.toUTCString();
            }
            xml += `      <${key}>${escapeXml(value.toString())}</${key}>\n`;
        });
        xml += `    </item>\n`;
    });

    // Close XML tags
    xml += `  </channel>\n`;
    xml += `</rss>`;
    return xml;
}
