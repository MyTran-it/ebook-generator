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