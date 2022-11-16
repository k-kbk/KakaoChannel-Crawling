const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// 이전 댓글 버튼
const prevBtn = '#mArticle > div > div:nth-child(3) > div.cmt_btn > button:nth-child(1)';
// 댓글 목록
const cmtDiv = '#mArticle > div > div:nth-child(3) > div.cmt_bundle > div.item_cmt';

(async () => {
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
  await page.waitForSelector('#mArticle > div > div:nth-child(3) > div.cmt_bundle');
  const data = await page.$$(cmtDiv);
  data.forEach(async (item) => {
    const name = await item.$eval('div.info_cmt > strong', (el) => el.textContent);
    const desc = await item.$eval('div.info_cmt > p', (el) => el.textContent);
    fs.appendFileSync('댓글 목록.txt', `이름: ${name}\n내용: ${desc}\n\n`, {
      encoding: 'utf8',
    });
  });

  console.log('- 텍스트 파일 생성 완료');
  setTimeout(async () => await browser.close(), 1000);
})();
