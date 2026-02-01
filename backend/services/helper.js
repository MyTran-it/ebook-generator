import fs from "fs/promises";
import fsSync from "fs";
import got from "got";
import sharp from "sharp";
import { log } from "console";

const MAX_SIZE_KB = 500; // 500 KB
const TIMEOUT_TO_IMG_DOWNLOAD = 10000; // 10 seconds

const RESIZE_IMG = {
  COVER: { width: 800, height: 1200, fit: "cover" },
  CONTENT: { width: 1200, height: 1200, fit: "inside" },
};

/**
 * Process tasks with concurrency limit
 * @param {Array<Function>} tasks - Array of async functions to execute
 * @param {Number} limit - Maximum number of concurrent tasks
 * @returns Array of results
 */
export async function processWithLimit(tasks, limit) {
  const results = [];
  for (let i = 0; i < tasks.length; i += limit) {
    const batch = tasks.slice(i, i + limit);
    const batchResults = await Promise.all(batch.map((task) => task()));
    results.push(...batchResults);
  }
  return results;
}

/**
 * Download image from url and save to destPath with fileName
 * @param {*} destPath
 * @param {*} fileName
 * @param {*} imgUrl
 * @param {*} isCover
 * @returns fileName with extension
 */
export async function imgDownloader(
  destPath,
  fileName,
  imgUrl,
  isCover = false,
) {
    const fullFileName = `${destPath}${fileName}.jpeg`;
    const returnFileName = `${fileName}.jpeg`;
  
    try {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      TIMEOUT_TO_IMG_DOWNLOAD,
    );

    const response = await got(imgUrl, {
      responseType: "buffer",
      signal: controller.signal,
    });
    clearTimeout(timeout);

    let buffer = response.body;
    const fileSizeKB = buffer.length / 1024;

    const shouldResize = isCover || fileSizeKB > MAX_SIZE_KB;
    if (shouldResize) {
      const opts = RESIZE_IMG[isCover ? "COVER" : "CONTENT"];

      buffer = await sharp(buffer)
        .resize(opts.width, opts.height, {
          fit: opts.fit,
          withoutEnlargement: !isCover,
        })
        .jpeg({ quality: 70 })
        .toBuffer();
    }

    await fs.writeFile(fullFileName, buffer);
    return returnFileName;
  } catch (err) {
    console.error(err.message);
    if (isCover) {
      const placeholder = await sharp({
        create: {
          width: 800,
          height: 1200,
          channels: 3,
          background: { r: 169, g: 169, b: 169 },
        },
      })
        .jpeg({ quality: 90, mozjpeg: true })
        .toBuffer();
      await fs.writeFile(fullFileName, placeholder);
      console.warn(`Cover image download failed, placeholder created.`);
      return returnFileName;
    }
    throw new Error(`Failed to download image: ${err.message}`);
  }
}

/**
 * Create directory
 * @param {String} destPath
 * @param {Boolean} removeOldDir - whether to remove old directory if exists
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
 * @param {String} filename - file name
 * @param {String} content - content to write
 */
export async function CREATE_FILE(destPath, filename, content) {
  try {
    const filePath = `${destPath}${filename}`;
    const isNewFile = !fsSync.existsSync(filePath);

    await fs.appendFile(filePath, content);
    const message = isNewFile ? "has been created!" : "has been updated!";
    log(`${filename} ${message}`);
  } catch (err) {
    throw new Error(`Failed to create file: ${err.message}`);
  }
}