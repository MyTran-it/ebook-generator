import * as cheerio from "cheerio";
import got from "got";
import { decodeHTML } from "entities";
import { CookieJar } from "tough-cookie";
import { BOOK } from "./cts.js";
import { imgDownloader } from "./helper.js";
import { replaceImageUrlsWithFilenames } from "./createBook.js";

export function cleanHtml(html) {
  return decodeHTML(html || "");
}

export async function GET_ALL_CHAPTER_URL(querySelector) {
  try {
    const response = await fetch(querySelector.URL);
    const html = await response.text();
    const $ = cheerio.load(html);
    const chapters = $(querySelector.CHAPTERURL)
      .map((_, el) => $(el).attr("href"))
      .get();
    const coverUrl = $(querySelector.COVER).attr("src");
    await imgDownloader(
      "./newBook/",
      "cover",
      coverUrl,
      true,
    );
    const cleanCoverPath = { [coverUrl]: "cover.jpeg" };
    // const description = cleanHtml(await GET_ALL_CONTENT($, querySelector.DESCRIPTION));
    const description = BOOK.DESCRIPTION || "";
    const convertedDescription = replaceImageUrlsWithFilenames(description, [cleanCoverPath]);
    return { chapters, description: convertedDescription };
  } catch (error) {
    console.error(error);
    return { chapters: [], title: "" };
  }
}

async function fetchUnlockedHtml(loginFormApi, url, passwords) {
  // passwords là string → convert thành array
  const passList = Array.isArray(passwords) ? passwords : [passwords];

  for (const password of passList) {
    const jar = new CookieJar();
    
    try {
      console.log(`🔑 Thử password: "${password}"`);
      
      const loginRes = await got.post(loginFormApi, {
        cookieJar: jar,
        form: { redirect_to: url, post_password: password, Submit: "Nhập" },
        followRedirect: true,
        throwHttpErrors: false,
      });

      const $ = cheerio.load(loginRes.body);

      // Check login fail
      if ($(BOOK.PASSWORD_FIELD).length > 0) {
        console.log(`❌ Password "${password}" sai`);
        continue;
      }

      // Fetch content
      const res = await got.get(url, { cookieJar: jar });
      
      return res.body;
    } catch (err) {
      console.log(`❌ Password "${password}" error:`, err.message);
      continue;
    }
  }
  
  throw new Error(`Không unlock được với ${passList.length} passwords`);
}


export async function GET_CONTENT_BY_QUERY(
  url,
  querySelector,
  password = null,
) {
  try {
    const response = await fetch(url);
    let html = await response.text();
    console.log(`Fetched chapter URL: ${url}`);

    let $ = cheerio.load(html);

    const hasPasswordForm = $(querySelector.PASSWORD_FIELD).length > 0;

    if (hasPasswordForm && querySelector.PASSWORD) {
      console.log("Password form detected. Attempting to unlock...");
      const loginFormApi = $(querySelector.LOGIN_FORM_API).attr("action");
      const unlockedHtml = await fetchUnlockedHtml(loginFormApi, url, password);

      const $unlocked = cheerio.load(unlockedHtml);

      // Check if still locked
      const stillLocked = $unlocked(BOOK.PASSWORD_FIELD).length > 0;

      if (stillLocked) {
        console.log("Password incorrect. Using original HTML.");
      } else {
        console.log("Post unlocked successfully.");
        $ = $unlocked; // Reassign unlocked version
        html = unlockedHtml;
      }
    }

    const title = $(querySelector.TITLECHAP).first().text().trim();
    const content = cleanHtml(await GET_ALL_CONTENT($, querySelector.CONTENT));
    const imgList = await GET_ALL_IMG_URL($, querySelector.IMG);

    return { title, content, imgList };
  } catch (error) {
    throw error;
  }
}

export async function GET_ALL_IMG_URL($, querySelector) {
  try {
    return $(querySelector)
      .map((_, el) => $(el).attr("src"))
      .get();
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
