import commandExists from "command-exists";
import { GET_ALL_CHAPTER_URL, GET_CONTENT_BY_QUERY } from "./cheerioHelpers.js";
import BOOK from "./cts.js";
import {
  CREATE_CHAPTER,
  SAVE_IMG,
  CREATE_DIRECTORY,
  CREATE_TOC,
  CREATE_FIRST_TOC,
  CREATE_INDEX,
  CREATE_FINAL_TOC,
} from "./createBook.js";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Concurrency limiter
async function processWithLimit(tasks, limit) {
  const results = [];
  for (let i = 0; i < tasks.length; i += limit) {
    const batch = tasks.slice(i, i + limit);
    const batchResults = await Promise.all(batch.map((task) => task()));
    results.push(...batchResults);
  }
  return results;
}

(async () => {
  let allChap = [];
  // Book with many page of chapter
  // for (let i = 1; i < 4; i++) {
  //   const listChapter = await GET_ALL_CHAPTER_URL(
  //     BOOK.URL + `/trang-${i}`,
  //     BOOK.CHAPTERURL
  //   );
  //   allChap = [...allChap, ...listChapter];
  // }

  const { chapters: listChapter, title: bookTitle } = await GET_ALL_CHAPTER_URL(
    BOOK
  );
  allChap = [...allChap, ...listChapter];

  const destPath = `./${bookTitle.replaceAll(" ", "")}/`;
  await CREATE_DIRECTORY(destPath, false);
  await CREATE_FIRST_TOC(destPath);

  // const startIdx = 187; // start chapter - 1
  // const endIdx = 191; // end chapter

  // allChap = allChap.slice(startIdx, endIdx);

  const concurrencyLimit = 3; // Process 3 chapters at a time

  const tasks = allChap.map((chapUrl, _idx) => async () => {
    // const actualIdx = startIdx + _idx;
    // const password = (actualIdx + 1).toString() + '7';
    const actualIdx = _idx;
    const password = BOOK.PASSWORD; //array or string
    try {
      await sleep(300); // Keep some delay to be respectful
      const response = await GET_CONTENT_BY_QUERY(chapUrl, BOOK, password);

      const list_img = await SAVE_IMG(
        destPath,
        response.imgList,
        actualIdx + 1
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

  const chapterResults = await processWithLimit(tasks, concurrencyLimit);

  // Sort theo idx để đúng thứ tự (filter null errors)
  const sortedResults = chapterResults
    .filter(Boolean)
    .sort((a, b) => a.idx - b.idx);

  for (const { idx, title, content, list_img } of sortedResults) {
    await CREATE_TOC(destPath, idx, title); // Bây giờ mới tạo, theo thứ tự
    await CREATE_CHAPTER(destPath, idx, title, content, list_img);
  }

  // Create final toc.ncx
  await CREATE_FINAL_TOC(destPath, bookTitle);

  await commandExists("ebook-convert")
    .then(async () => {
      console.log("ebook-convert found, starting conversion...");
      const { convertToEpub } = await import("./epubConverter.js");
      await convertToEpub(destPath, bookTitle.replaceAll(" ", ""));
    })
    .catch(() => {
      console.log(
        "ebook-convert not found, skipping conversion. Please install Calibre to use this feature."
      );
    });
})();
