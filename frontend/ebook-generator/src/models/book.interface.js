export class Book {
  constructor(config = {}) {
    this.URL = config.URL || '';
    
    // CSS Selectors cho scraping
    this.TITLE = config.TITLE || 'div.entry-content h2';
    this.COVER = config.COVER || 'div.entry-content img';
    this.DESCRIPTION = config.DESCRIPTION || '';
    this.CHAPTERURL = config.CHAPTERURL || 'div.entry-content > p a';
    this.NUMCHAP = config.NUMCHAP || 'h1.entry-title';
    this.TITLECHAP = config.TITLECHAP || 'div.entry-content > p strong, div.entry-content > p b';
    this.CONTENT = config.CONTENT || 'div.entry-content > p';
    this.IMG = config.IMG || 'div.entry-content img';
    
    // Auth
    this.LOGIN_FORM_API = config.LOGIN_FORM_API || 'form.post-password-form';
    this.PASSWORD_FIELD = config.PASSWORD_FIELD || "input[name='post_password']";
  }

  // ✅ Tạo Book từ URL nhanh
  static fromURL(url, customSelectors = {}) {
    return new Book({
      URL: url,
      ...customSelectors
    });
  }

  // ✅ Preset cho các site phổ biến
  static wordpress() {
    return new Book({
      TITLE: 'div.entry-content h2',
      COVER: 'div.entry-content img',
      CHAPTERURL: 'div.entry-content > p a',
      NUMCHAP: 'h1.entry-title',
      TITLECHAP: 'div.entry-content > p strong, div.entry-content > p b',
      CONTENT: 'div.entry-content > p',
      IMG: 'div.entry-content img',
      LOGIN_FORM_API: 'form.post-password-form',
      PASSWORD_FIELD: "input[name='post_password']"
    });
  }

  // ✅ Validate config
  validate() {
    const required = ['URL', 'TITLE', 'CONTENT'];
    for (const field of required) {
      if (!this[field]) {
        throw new Error(`Missing required selector: ${field}`);
      }
    }
    return true;
  }
}
