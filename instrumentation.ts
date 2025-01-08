// instrumentation.ts
import { generateFeedXML } from "./utils/feed"
export async function register() {
    console.log("This code will run during build");
    // 在这里添加你想在构建时执行的代码
    generateFeedXML()
}