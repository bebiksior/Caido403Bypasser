import { type Template } from "shared";

export const userAgentTemplate: Template = {
  id: "user-agent",
  description: "Sends the request using a different HTTP user agent.",
  enabled: true,
  modificationScript: `
const userAgents = [
  "0",
  "APIs-Google (+https://developers.google.com/webmasters/APIs-Google.html)",
  "CCBot/2.0 (http://commoncrawl.org/faq/)",
  "DuckDuckBot/1.0; (+http://duckduckgo.com/duckduckbot.html)",
  "Go-http-client/1.1",
  "Google-HTTP-Java-Client/1.34.2 (gzip)",
  "Java/1.8.0_202",
  "Mediapartners-Google",
  "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.0)",
  "Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.6478.126 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  "Mozilla/5.0 (Linux; Android 8.0; Pixel 2 Build/OPD3.170816.012) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36",
  "Mozilla/5.0 (Linux; U; Android 2.2; fr-fr; DesireA8181 Build/FRF91) App3leWebKit/53.1 (KHTML like Gecko) Version/4.0 Mobile Safari/533.1",
  "Mozilla/5.0 (Linux; U; Android 8.1.0; zh-CN; EML-AL00 Build/HUAWEIEML-AL00) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/57.0.2987.108 baidu.sogo.uc.UCBrowser/11.9.4.974 UWS/2.13.1.48 Mobile Safari/537.36 AliApp(DingTalk/4.5.11) com.alibaba.android.rimet/10487439 Channel/227200 language/zh-CN",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 1094) AppleWebKit/537.78.2 (KHTML like Gecko) Version/7.0.6 Safari/537.78.2",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/600.2.5 (KHTML, like Gecko) Version/8.0.2 Safari/600.2.5 (Amazonbot/0.1; +https://developer.amazon.com/support/amazonbot)",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/17.17134",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/118.0",
  "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36 QIHU 360SE",
  "Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.129 Safari/537.36",
  "Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)",
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  "Mozilla/5.0 (compatible; SemrushBot/7~bl; +http://www.semrush.com/bot.html",
  "Mozilla/5.0 (compatible; Yahoo! Slurp; http://help.yahoo.com/help/us/ysearch/slurp)",
  "Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)",
  "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
  "Mozilla/5.0 (iPad; CPU OS 613 like Mac OS X) AppleWebKit/536.26 (KHTML like Gecko) Version/6.0 Mobile/10B329 Safari/8536.25",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 712 like Mac OS X) AppleWebKit/537.51.2 (KHTML like Gecko) Version/7.0 Mobile/11D257 Safari/9537.53",
  "MyClearpayModule/1.0.0 (E-Commerce Platform Name/1.0.0; PHP/7.0.0; Merchantname/60032000)",
  "NOWPayments v1.0",
  "Opera/9.80 (Windows NT 6.2; Win64; x64) Presto/2.12 Version/12.16",
  "PHP/5.2.10",
  "PayPal IPN ( https://www.paypal.com/ipn )",
  "PayPalSDK/PayPal-node-SDK 1.7.1 (node v6.11.0-x64-linux;OpenSSL 1.0.2k)",
  "Ruby",
  "Symfony2 BrowserKit",
  "curl/7.36.0",
  "default",
  "localhost",
  "msnbot/2.0b (+http://search.msn.com/msnbot.htm)",
  "null",
  "okhttp/3.14.9",
  "python-requests/2.20.0"
];

const modifiedRequests = userAgents.map(ua => {
  const withoutUA = helper.removeHeader(input, "User-Agent");
  return helper.addHeader(withoutUA, \`User-Agent: \${ua}\`);
});

return modifiedRequests;`.trim(),
};
