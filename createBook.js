import fs from "fs";
import IMG_DOWNLOADER from "image-downloader";

export function createDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  fs.mkdir(dir, (err) => {
    if (err) {
      throw err;
    }
    console.log(" is creating ...\n");
  });
}

// export function createStartBook() {
//   let startPage = 
// }

export function createFile(directory, nameFile, content) {
  let isNewFile = !fs.existsSync(directory + nameFile);

  fs.appendFile(directory + nameFile, content, function (err) {
    if (err) throw err;
    if (isNewFile) {
      console.log("\x1b[34m", nameFile + " has been created!");
    } else {
      console.log("\x1b[32m", nameFile + " has been updated!");
    }
  });
}

export async function CREATE_CHAPTER(dirPath, num, titleChap, htmlContent) {
  const content =
    "<?xml version='1.0' encoding='utf-8'?><html xmlns='http://www.w3.org/1999/xhtml'><head><title>" +
    num +
    "</title><link href='stylesheet.css' rel='stylesheet' type='text/css'/>" +
    "</head><body>" +
    "<h3>" +
    titleChap +
    "</h3>" +
    htmlContent +
    "</body></html>";

  createFile(dirPath, num + ".xhtml", content);
}

export function CREATE_TOC(dirPath, idx, titleChap) {
  const toc =
    "<navPoint id='num_" +
    idx +
    "' playOrder='" +
    idx +
    "'>\n\t<navLabel>\n\t\t<text>" +
    // numChap + ":" +
    titleChap +
    "</text>\n\t</navLabel>\n\t<content src='" +
    idx +
    ".xhtml'/>\n</navPoint>\n";
  createFile(dirPath, "toc.txt", toc);
}

/**
 *
 * List of img url in the chapter
 * @param {Array} listImgUrl
 */
export async function SAVE_IMG(dirPath, listImgUrl) {
  if (listImgUrl.length === 0) return;
  return Promise.all(
    listImgUrl.map(async (_, imgUrl) => {
      return await IMG_DOWNLOADER.image({
        url: imgUrl,
        dest: dirPath,
      }).catch((err) => console.error(err));
    })
  );
}
