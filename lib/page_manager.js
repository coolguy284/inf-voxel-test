class PageManager {
  #pages;
  #currentPage;
  
  constructor(pages, startingPage) {
    this.#pages = pages;
    this.#currentPage = startingPage;
  }
  
  #hideCurrentPage() {
    this.#hidePage(this.#currentPage);
  }
  
  #hidePage(page) {
    if (page != null) {
      this.#pages[page].htmlElem.style.display = 'none';
    }
  }
  
  #showPage(page) {
    if (page != null) {
      this.#pages[page].htmlElem.style.display = '';
    }
  }
  
  switchPage(page) {
    if (page == null) {
      this.#hideCurrentPage();
      this.#currentPage = null;
    } else if (page in this.#pages) {
      this.#hideCurrentPage();
      this.#showPage(page);
      this.#currentPage = page;
    } else {
      throw new Error(`${page} not in page list`);
    }
  }
}
