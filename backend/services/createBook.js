import fs from "fs/promises";
import fsSync from "fs";
import { processWithLimit, imgDownloader, CREATE_FILE } from "./helper.js";

const HEADER_INDEX = `<?xml version='1.0' encoding='utf-8'?>\n<html xmlns='http://www.w3.org/1999/xhtml'>\n<head>\n<title>Mục lục</title>\n<link href='stylesheet.css' rel='stylesheet' type='text/css'/>\n</head>\n<body>\n`;
const HEADER_AFTER_DESCRIPTION = `<nav>\n<h3>Mục lục</h3>\n`;
const FOOTER_INDEX = `</nav>\n</body>\n</html>`;
const CONCURRENCY_LIMIT_IMG = 5; // Process 5 images at a time

async function prependFile(filePath, text) {
  try {
    const oldContent = await fs.readFile(filePath, "utf8");
    const newContent = text + oldContent;
    await fs.writeFile(filePath, newContent);
  } catch (err) {
    if (err.code === "ENOENT") {
      await fs.writeFile(filePath, text);
    } else {
      throw err;
    }
  }
}

/**
 * Create Index chapter
 */
export async function UPDATE_INDEX(destPath, validChapter) {
  const filePath = `${destPath}/index.xhtml`;
  const content = `<a href="${validChapter.url}">${validChapter.title}</a><br/>\n`;
  const isNewFile = !fsSync.existsSync(filePath);

  if (isNewFile) {
    await fs.writeFile(filePath, content);
  } else {
    await fs.appendFile(filePath, content);
  }
}

export async function CREATE_FINAL_INDEX(destPath, bookDescription = "") {
  try {
    const indexPath = `${destPath}/index.xhtml`;
    if (!fsSync.existsSync(indexPath)) {
      await fs.writeFile(
        indexPath,
        HEADER_INDEX +
          bookDescription +
          "\n" +
          HEADER_AFTER_DESCRIPTION +
          FOOTER_INDEX,
      );
      return;
    }
    await prependFile(
      indexPath,
      HEADER_INDEX + bookDescription + "\n" + HEADER_AFTER_DESCRIPTION,
    );
    await fs.appendFile(indexPath, FOOTER_INDEX);

    console.log("Finalized index.xhtml file.");
  } catch (err) {
    throw new Error(`Failed to create final Index: ${err.message}`);
  }
}

/**
 * Generate chapter content .xhtml
 * @param {*} rawContent Input raw HTML content, ideally converted Img sources
 * @param {*} titleChap Title of the chapter
 * @returns String content of chapter in xhtml format
 */
export function GENERATE_CONTENT(rawContent, titleChap) {
  return `<?xml version='1.0' encoding='utf-8'?>\n<html xmlns='http://www.w3.org/1999/xhtml'>\n<head>\n<title>${titleChap}</title>\n<link href='stylesheet.css' rel='stylesheet' type='text/css'/>\n</head>\n<body>\n<h3>${titleChap}</h3>\n${rawContent}</body>\n</html>`;
}

/**
 * Create file of chapter in Destination path
 * @param {String} destPath Destination path
 * @param {Number} numChap Chapter number
 * @param {String} titleChap Chapter title
 * @param {String} htmlContent raw HTML content
 * @param {Array} listImg List of images mapping old URLs to new filenames
 * @returns Object with url and title of created chapter
 */
export async function CREATE_CHAPTER(
  destPath,
  numChap,
  titleChap,
  htmlContent,
  listImg,
) {
  // Convert image URLs in content to local filenames
  const convertedContent = replaceImageUrlsWithFilenames(htmlContent, listImg);

  // Generate full chapter content
  const content = GENERATE_CONTENT(convertedContent, titleChap);
  await CREATE_FILE(destPath, `${numChap}.xhtml`, content);
  return { url: `${numChap}.xhtml`, title: titleChap };
}

/**
 * Save images with compression support
 * @param {String} destPath
 * @param {Array} listImgUrl
 * @param {Number} chapNum - chapter number
 * @param {Number} maxSizeKB - max file size in KB
 * @returns {Array} - Array of objects mapping old URLs to new filenames
 */
export async function SAVE_IMG_BY_CHAPTER(destPath, listImgUrl, chapNum) {
  if (listImgUrl.length === 0) return [];

  try {
    const tasks = listImgUrl.map((imgUrl, index) => async () => {
      const filenameNoExt = `chap_${chapNum}_img_${index}`;
      const filename = await imgDownloader(destPath, filenameNoExt, imgUrl);

      if (!filename) return null;

      const url = new URL(imgUrl);
      const oldText = `${url.href}`;
      return { [oldText]: filename };
    });
    return await processWithLimit(tasks, CONCURRENCY_LIMIT_IMG);
  } catch (err) {
    console.error(`Image save failed: ${err.message}`);
    return [];
  }
}

/**
 *  Convert image URLs in content to local filenames
 * @param {String} content
 * @param {Array} listImg
 * @returns {String} Converted content
 */
export function replaceImageUrlsWithFilenames (content, listImg) {
  if (!listImg || !content) return content;

  let convertedContent = content;

  listImg
    .filter((item) => item !== null)
    .forEach((item) => {
      const [oldText, newText] = [Object.keys(item)[0], Object.values(item)[0]];
      convertedContent = convertedContent.replaceAll(oldText, newText);
    });

  return convertedContent;
}
