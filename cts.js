const DESCRIPTION = ``;


export const BOOK = {
  //query
  URL: "https://example.com/book-page",
  TITLE: "h1.entry-title",
  COVER: "div.entry-content img",
  DESCRIPTION: DESCRIPTION,
  CHAPTERURL: "div.entry-content > p a",
  NUMCHAP: "h1.entry-title",
  TITLECHAP: "div.entry-content > p strong, div.entry-content > p b",
  CONTENT: "div.entry-content > p:not(:first-of-type)",
  IMG: "div.entry-content img",
  LOGIN_FORM_API: "form.post-password-form",
  PASSWORD_FIELD: 'input[name="post_password"]',
  PASSWORD: [ "your_password_here" ], //array or string
};

export const METADATA = {
  "--title": '""',
  "--authors": '""',
  "--tags": '""',
  "--language": '"vi"',
  "--toc-threshold": '"0"',
};

//NUMCHAP: "div.post-content p:first-child",
//TITLECHAP: "div.post-content > div:nth-child(1) > p:nth-child(1)",
//CONTENT: "div.post-content > div:nth-child(1) :not(:first-child, :last-child)",

// TITLECHAP: "div.entry-content > p:first-of-type",
// CONTENT: "div.entry-content > p:not(:first-of-type):not(:last-of-type):not(:empty)",
// IMG: "div.entry-content img",
