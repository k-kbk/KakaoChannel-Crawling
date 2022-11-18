const puppeteer = require('puppeteer');
const xlsx = require('xlsx');

// 이전 댓글 버튼
const prevBtn =
  '#mArticle > div > div:nth-child(3) > div.cmt_btn > button:nth-child(1)';
// 댓글 목록
const cmtDiv =
  '#mArticle > div > div:nth-child(3) > div.cmt_bundle > div.item_cmt';

(async () => {
  const book = xlsx.utils.book_new();
  const set = new Set();
  const arr = [];
  const browser = await puppeteer.launch({
    headless: true,
  });
  const page = await browser.newPage();
  await page.goto('https://pf.kakao.com/_TPxcVxj/97374739');

  console.log('- 댓글 로딩 중');
  await page.waitForSelector(prevBtn);
  while (await page.$(prevBtn)) {
    await page.click(prevBtn);
  }

  console.log('- 데이터 추출 중');
  await page.waitForSelector(
    '#mArticle > div > div:nth-child(n+1) > div.cmt_bundle'
  );
  const data = await page.$$(cmtDiv);
  data.forEach(async (item) => {
    const name = await item.$eval(
      'div.info_cmt > strong',
      (el) => el.textContent
    );
    const time = await item.$eval(
      'div.info_cmt > span',
      (el) => el.textContent
    );
    const desc = await item.$eval('div.info_cmt > p', (el) => el.textContent);
    set.add(`${time}[]${name}[]${desc}`);
  });

  setTimeout(async () => {
    set.forEach((item) => {
      arr.push(item.split('[]'));
    });
    const comments = xlsx.utils.aoa_to_sheet(arr);
    comments['!cols'] = [{ wpx: 110 }, { wpx: 100 }, { wpx: 500 }];
    xlsx.utils.book_append_sheet(book, comments, '댓글 목록');
    xlsx.writeFile(book, 'comments.xlsx');
    console.log('엑셀 파일 생성 완료');
    await browser.close();
  }, 1000);
})();
