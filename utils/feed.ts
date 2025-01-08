// 读取Posts 建立 feed.xml 提供 RSS

import fs from "fs";
import { getSortedPostsData, getPostData } from "./posts"

export function generateFeedXML() {
    const postList = getSortedPostsData()
    const metaData = {
        title: "Zhuxb Blog",
        description: "Share Everything I know.",
        link: "https://www.zhuxb.dev/",
        lastBuildDate: new Date(),
        pubDate: new Date(),
    }

    const promise = Promise.all(postList.map(p => getPostData([p.path])))
    promise.then(res => {
        const itemData = postList.map((post, index) => ({
            title: post.title,
            description: "",
            link: `https://www.zhuxb.dev/posts/${post.path}`,
            guid: post.id,
            pubDate: new Date(post.date),
            content: res[index].rawCotent
        }))

        fs.writeFileSync("./public/feed.xml", convertToXml(metaData, itemData))
    })
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
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case '\'': return '&apos;';
                case '\"': return '&quot;';
                default: return `&#${c.charCodeAt(0)};`;
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
    itemData.forEach(item => {
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