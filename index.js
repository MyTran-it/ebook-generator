import { GET_ALL_CHAPTER_URL, GET_CONTENT_BY_QUERY } from "./cheerioHelpers.js";
import BOOK from "./cts.js";
import {
  CREATE_CHAPTER,
  SAVE_IMG,
  createDir,
  CREATE_TOC,
} from "./createBook.js";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

(async () => {
  const dir = "./newbook/";
  createDir(dir);

  let allChap = [];
  // Book with many page of chapter
  // for (let i = 1; i < 4; i++) {
  //   const listChapter = await GET_ALL_CHAPTER_URL(
  //     BOOK.URL + `/trang-${i}`,
  //     BOOK.CHAPTERURL
  //   );
  //   allChap = [...allChap, ...listChapter];
  // }

  const listChapter = await GET_ALL_CHAPTER_URL(BOOK.URL, BOOK.CHAPTERURL);
  allChap = [...allChap, ...listChapter];
  
  for (const [_idx, chapUrl] of allChap.entries()) {
    try {
      await sleep(1000);
      const response = await GET_CONTENT_BY_QUERY(chapUrl, BOOK);
      await CREATE_CHAPTER(dir, _idx, response.title, response.content);
      await SAVE_IMG(dir, response.imgList);
      CREATE_TOC(dir, _idx, response.title);
    } catch (error) {
      console.log("error", error);
    }
  }
})();
