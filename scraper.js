var cheerio = require("cheerio");
var request = require("request");
var fs = require("fs");
var csv = require("fast-csv");

var rootUrl = "http://www.shirts4mike.com/";

scrapeSiteAndSaveData();

// main function that scrapes the site and saves the data as a csv
function scrapeSiteAndSaveData() {
  makeDataDir();

  var csvStream = csv.format({ headers: true });
  var writableStream = fs.createWriteStream(csvPath());
  csvStream.pipe(writableStream);

  scrapeMainSite(csvStream);
}

// create "data" directory if one doesn't already exist
function makeDataDir() {
  if (!fs.existsSync("data")) {
    fs.mkdirSync("data");
  }
}

// path for csv file in data directory with today's date as file name
function csvPath() {
  var todayDate = new Date().toISOString().slice(0,10);
  return "data/" + todayDate + ".csv";
}

// visit the main t-shirt site and loop through the t-shirts,
// visiting each t-shirt's individual site scraping the data from each
function scrapeMainSite(csvStream) {
  request(rootUrl, function(error, response, html) {
    if (!error && response.statusCode === 200) {
      var $ = cheerio.load(html);
      $(".products li a").each(function(i, element) {
        var shirtPath = $(this).attr("href");

        scrapeShirtSite(shirtPath, csvStream);
      });
    }
  });
}

// scrape the data from an individual t-shirt's site
// and write its data to the csv
function scrapeShirtSite(shirtPath, csvStream) {
  var shirtUrl = rootUrl + shirtPath;

  request(shirtUrl, function(error, response, html) {
    if (!error && response.statusCode === 200) {
      var $ = cheerio.load(html);
      var title = $("title").text();
      var price = $(".price").text();
      var imagePath = $(".shirt-picture img").attr("src");
      
      var metadata = { 
        Title: title, 
        Price: price, 
        ImageURL: rootUrl + imagePath, 
        URL: shirtUrl 
      }

      csvStream.write(metadata);
    }
  });
}
