import * as cheerio from "cheerio";

export async function GET_ALL_CHAPTER_URL(url, querySelector) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);
    return $(querySelector).map((_, el) => $(el).attr("href"));
  } catch (error) {
    console.error(error);
  }
}

export async function GET_CONTENT_BY_QUERY(url, querySelector) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);
    console.log(url);
    const title = $(querySelector.TITLECHAP).text();
    //const content = $(querySelector.CONTENT).html(); //works with content without <p/>
    const content = await GET_ALL_CONTENT($, querySelector.CONTENT);
    const imgList = await GET_ALL_IMG_URL($, querySelector.IMG);
    return { title, content, imgList };
  } catch (error) {
    throw error;
  }
}

export async function GET_ALL_IMG_URL($, querySelector) {
  try {
    return $(querySelector).map((_, el) => $(el).attr("src"));
  } catch (error) {
    console.error(error);
  }
}

export async function GET_ALL_CONTENT($, querySelector) {
  try {
    let array_content = [];
    $(querySelector).map((_, el) => {
      if ($(el).css("opacity") !== "0") {
        const hasInvisibleElement = $(el)
          .children()
          .toArray()
          .some((child) => {
            return $(child).css("opacity") === "0";
          });

        if (hasInvisibleElement) return null;
        array_content.push($(el).prop("outerHTML"));
      }
    });
    return array_content.join("");
  } catch (error) {
    console.error(error);
  }
}
