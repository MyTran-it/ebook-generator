import { log } from "console";
import fs from "fs/promises";
import fsSync from "fs";
import got from "got";
import sharp from "sharp";

/**
 * Create directory if not exist
 * @param {String} destPath
 */
export async function CREATE_DIRECTORY(destPath, removeOldDir = true) {
  try {
    if (fsSync.existsSync(destPath)) {
      if (removeOldDir) {
        log("Removing old directory...\n");
        await fs.rm(destPath, { recursive: true, force: true });
      } else {
        return;
      }
    }
    log(`Creating directory at: ${destPath}\n`);
    await fs.mkdir(destPath, { recursive: true });
    log("Directory is being created...\n");
  } catch (err) {
    throw new Error(`Failed to create directory: ${err.message}`);
  }
}

/**
 * Create or append content to a file
 * @param {String} destPath - directory path
 * @param {String} nameFile - file name
 * @param {String} content - content to write
 */
export async function CREATE_FILE(destPath, nameFile, content) {
  try {
    const filePath = `${destPath}${nameFile}`;
    const isNewFile = !fsSync.existsSync(filePath);

    await fs.appendFile(filePath, content);
    const color = isNewFile ? "\x1b[34m" : "\x1b[32m";
    const message = isNewFile ? "has been created!" : "has been updated!";
    log(color, `${nameFile} ${message}`);
  } catch (err) {
    throw new Error(`Failed to create file: ${err.message}`);
  }
}

/**
 * Create chapter file
 * @param {String} destPath
 * @param {Number} num
 * @param {String} titleChap
 * @param {String} htmlContent
 */
export async function CREATE_CHAPTER(
  destPath,
  num,
  titleChap,
  htmlContent,
  listImg
) {
  const convertedContent = convertImgContent(htmlContent, listImg);

  const content = `<?xml version='1.0' encoding='utf-8'?><html xmlns='http://www.w3.org/1999/xhtml'><head><title>${num}</title><link href='stylesheet.css' rel='stylesheet' type='text/css'/></head><body><h3>${titleChap}</h3>${convertedContent}</body></html>`;

  await CREATE_FILE(destPath, `${num}.xhtml`, content);
}

/**
 * Create TOC entry
 * @param {String} destPath
 * @param {Number} idx
 * @param {String} titleChap
 */
export async function CREATE_TOC(destPath, idx, titleChap) {
  const toc = `<navPoint id='num_${idx}' playOrder='${idx}'>\n\t<navLabel>\n\t\t<text>${titleChap}</text>\n\t</navLabel>\n\t<content src='${idx}.xhtml'/>\n</navPoint>\n`;
  await CREATE_FILE(destPath, "toc.txt", toc);
}

/**
 * Create first TOC entry
 * @param {String} destPath
 */
export async function CREATE_FIRST_TOC(destPath) {
  try {
    const firstToc =
      "<navPoint id='num_0' playOrder='0'>\n\t<navLabel>\n\t\t<text>Giới thiệu</text>\n\t</navLabel>\n\t<content src='start.xhtml'/>\n</navPoint>\n";
    await CREATE_FILE(destPath, "toc.txt", firstToc);
  } catch (err) {
    throw new Error(`Failed to create first TOC: ${err.message}`);
  }
}

/** * Create index chapter
 * @param {String} destPath
 * @param {Array} validChapters - array of {num, title}
 */
export async function CREATE_INDEX(destPath, validChapters) {
  const indexNum = validChapters.length + 1;
  const indexTitle = "Mục lục";
  const indexContent = validChapters
    .map((ch) => `<p><a href="${ch.num}.xhtml">${ch.num}. ${ch.title}</a></p>`)
    .join("\n");
  await CREATE_CHAPTER(destPath, indexNum, indexTitle, indexContent, []);
  await CREATE_TOC(destPath, indexNum, indexTitle);
}

/** *  Create final TOC file
 * @param {String} destPath
 */
export async function CREATE_FINAL_TOC(destPath, bookTitle) {
  try {
    const tocContent = await fs.readFile(`${destPath}toc.txt`, "utf8");
    const uid = `uuid-${bookTitle
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")}-${Date.now()}`;
    const tocHeader = `<?xml version='1.0' encoding='utf-8'?>\n<!DOCTYPE ncx PUBLIC '-//NISO//DTD ncx 2005-1//EN' 'http://www.daisy.org/z3986/2005/ncx-2005-1.dtd'>\n<ncx xmlns='http://www.daisy.org/z3986/2005/ncx/' version='2005-1'>\n<head>\n\t<meta name='dtb:uid' content='${uid}'/>\n\t<meta name='dtb:depth' content='1'/>\n\t<meta name='dtb:totalPageCount' content='0'/>\n\t<meta name='dtb:maxPageNumber' content='0'/>\n</head>\n<docTitle>\n\t<text>${bookTitle}</text>\n</docTitle>\n<navMap>\n`;
    const tocFooter = `</navMap>\n</ncx>`;
    const finalToc = tocHeader + tocContent + tocFooter;
    await CREATE_FILE(destPath, "toc.ncx", finalToc);
    await fs.unlink(`${destPath}toc.txt`);
  } catch (err) {
    throw new Error(`Failed to create final TOC: ${err.message}`);
  }
}

/**
 * Download image with timeout
 * @param {String} url - image URL
 * @param {String} destPath - destination directory
 * @param {Number} chapNum - chapter number for filename prefix
 * @param {Number} imgIndex - image index in chapter
 * @param {Number} maxSizeKB - max file size in KB (default 500)
 * @param {Number} timeoutMs - timeout in milliseconds (default 10000)
 * @returns {Promise<String>} - saved filename or null
 */
export async function imgDownloader(
  url,
  destPath,
  chapNum,
  imgIndex,
  maxSizeKB = 500,
  timeoutMs = 10000
) {
  if (!url) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const response = await got(url, {
      responseType: "buffer",
      signal: controller.signal,
    });
    clearTimeout(timeout);

    let buffer = response.body;
    const fileSizeKB = buffer.length / 1024;

    // Compress if file is too large
    if (fileSizeKB > maxSizeKB) {
      buffer = await sharp(buffer)
        .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 70 })
        .toBuffer();
    }

    const ext = "jpeg";
    const filename = `chap_${chapNum}_img_${imgIndex}.${ext}`;

    await fs.writeFile(`${destPath}${filename}`, buffer);

    log(
      `\x1b[36m✓ Downloaded: ${filename} (${(buffer.length / 1024).toFixed(
        2
      )}KB)`
    );
    return filename;
  } catch (err) {
    if (err.name === "AbortError") {
      console.error(`⏱️  Image download timeout (${timeoutMs}ms): ${url}`);
    } else {
      log(`\x1b[31m✗ Image download failed: ${err.message}`);
    }
    return null;
  }
}

/**
 * Save images with compression support
 * @param {String} destPath
 * @param {Array} listImgUrl
 * @param {Number} chapNum - chapter number
 * @param {Number} maxSizeKB - max file size in KB
 * @returns {Array} - Array of objects mapping old URLs to new filenames
 */
export async function SAVE_IMG(destPath, listImgUrl, chapNum, maxSizeKB = 500) {
  log("\nStarting image download...", listImgUrl);
  if (listImgUrl.length === 0) return [];

  try {
    // Limit concurrent image downloads to 5
    const concurrencyLimit = 5;
    const results = [];
    for (let i = 0; i < listImgUrl.length; i += concurrencyLimit) {
      const batch = listImgUrl.slice(i, i + concurrencyLimit);
      const batchResults = await Promise.all(
        batch.map(async (imgUrl, index) => {
          const globalIndex = i + index;
          const filename = await imgDownloader(
            imgUrl,
            destPath,
            chapNum,
            globalIndex,
            maxSizeKB
          );
          if (!filename) return null;

          const url = new URL(imgUrl);

          const oldText = `${url.href}`;
          return { [oldText]: filename };
        })
      );
      results.push(...batchResults);
    }
    return results;
  } catch (err) {
    console.error(`Image save failed: ${err.message}`);
    return [];
  }
}

/**
 *  Convert image URLs in content to local filenames
 * @param {String} content
 * @param {Array} listImg
 * @returns
 */
export function convertImgContent(content, listImg) {
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
