var cheerio = require("cheerio");
var request = require("request");
var fs = require("fs");
var csv = require("fast-csv");

// sync or non-sync versions of file methods??

if (!fs.existsSync("data")) {
  fs.mkdirSync("data");
}

var todayDate = new Date().toISOString().slice(0,10);
var csv_path = "data/" + todayDate + ".csv";

var csvStream = csv.format({ headers: true });
var writableStream = fs.createWriteStream(csv_path);
csvStream.pipe(writableStream);

var rootPath = "http://www.shirts4mike.com/"
request(rootPath, function(error, response, html) {
  if (!error && response.statusCode === 200) {
    var $ = cheerio.load(html);
    $(".products li a").each(function(i, element) {
      var shirtPath = $(this).attr("href");
      var shirtUrl = rootPath + shirtPath;

      request(shirtUrl, function(error, response, html) {
        if (!error && response.statusCode === 200) {
          var $ = cheerio.load(html);
          var title = $("title").text();
          var price = $(".price").text();
          var imagePath = $(".shirt-picture img").attr("src");
          
          var metadata = { 
            Title: title, 
            Price: price, 
            ImageURL: rootPath + imagePath, 
            URL: shirtUrl 
          }

          csvStream.write(metadata);
        }
      });
    });
  }
});
