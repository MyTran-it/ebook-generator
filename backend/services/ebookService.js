import commandExists from "command-exists";
import { processWithLimit, CREATE_DIRECTORY } from "./helper.js";
import { GET_ALL_CHAPTER_URL, GET_CONTENT_BY_QUERY } from "./cheerioHelpers.js";
import {
  CREATE_CHAPTER,
  SAVE_IMG_BY_CHAPTER,
  CREATE_FINAL_INDEX,
  UPDATE_INDEX,
} from "./createBook.js";
import { FOLDER_NAME } from "../cts.js";
import { convertToEpub } from "./epubConverter.js";

const CONCURRENCY_LIMIT = 3; // Process 3 chapters at a time
const TIME_SLEEP_BETWEEN_CHAPTERS_MS = 300; // 300ms

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateEbook(BOOK, METADATA, CONVERT_TO_EBOOK = true) {
  await CREATE_DIRECTORY(FOLDER_NAME, true);
  let allChap = [];

  const { chapters, description: bookDescription } =
    await GET_ALL_CHAPTER_URL(BOOK);
  allChap = chapters;
  
  const startIdx = 0; // start chapter - 1
  const endIdx = 5; // end chapter
  allChap = allChap.slice(startIdx, endIdx);

  const tasks = allChap.map((chapUrl, _idx) => async () => {
    // const actualIdx = startIdx + _idx;
    // const password = (actualIdx + 1).toString() + '7';
    const actualIdx = _idx;
    const password = BOOK.PASSWORD; //array or string
    
    try {
      await sleep(TIME_SLEEP_BETWEEN_CHAPTERS_MS); // Keep some delay to be respectful
      const response = await GET_CONTENT_BY_QUERY(chapUrl, BOOK, password);

      const list_img = await SAVE_IMG_BY_CHAPTER(
        FOLDER_NAME,
        response.imgList,
        actualIdx + 1,
      );

      return {
        idx: actualIdx + 1,
        title: response.title,
        content: response.content,
        list_img,
      };
    } catch (error) {
      console.log("error", error);
      return null;
    }
  });

  const chapterResults = await processWithLimit(tasks, CONCURRENCY_LIMIT);

  // Sort chapters by index before creating files
  const sortedResults = chapterResults
    .filter(Boolean)
    .sort((a, b) => a.idx - b.idx);

  for (const { idx, title, content, list_img } of sortedResults) {
    const validChapter = await CREATE_CHAPTER(
      FOLDER_NAME,
      idx,
      title,
      content,
      list_img,
    );
    await UPDATE_INDEX(FOLDER_NAME, validChapter);
  }

  if (CONVERT_TO_EBOOK) {
    await CREATE_FINAL_INDEX(FOLDER_NAME, bookDescription);
    
    await commandExists("ebook-convert")
    .then(async () => {
      console.log("ebook-convert found, starting conversion...");
      await convertToEpub(FOLDER_NAME, METADATA);
    })
    .catch((e) => {
      console.log(
        "ebook-convert not found, skipping conversion. Please install Calibre to use this feature.",
        e
      );
    });
  }
};
