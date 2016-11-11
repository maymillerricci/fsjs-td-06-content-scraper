var cheerio = require("cheerio");
var request = require("request");
var fs = require("fs");

// sync or non-sync versions of file methods??

// if (!fs.existsSync("data")) {
//   fs.mkdirSync("data");
// }

// var todayDate = new Date().toISOString().slice(0,10);
// var csv_path = "data/" + todayDate + ".csv";
// fs.writeFileSync(csv_path, "data");

var rootPath = "http://www.shirts4mike.com/"
request(rootPath, function(error, response, html) {
  if (!error && response.statusCode === 200) {
    var $ = cheerio.load(html);
    $(".products li a").each(function(i, element) {
      var shirtPath = $(this).attr("href");
      var shirtUrl = rootPath + shirtPath;
      console.log(shirtUrl);
      request(shirtUrl, function(error, response, html) {
        if (!error && response.statusCode === 200) {
          var $ = cheerio.load(html);
          var title = $("title").text();
          var price = $(".price").text();
          var imagePath = $(".shirt-picture img").attr("src");
          console.log(title);
          console.log(price);
          console.log(rootPath + imagePath);
        }
      });
    });
  }
});
