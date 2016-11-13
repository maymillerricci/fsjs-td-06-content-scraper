/**
 * use cheerio and request packages for web scraping - chose because:
   * googling how to scape a site with node led to lots of results that use them
   * found a tutorial that walked through web scraping with them that i could easily follow:
     * https://www.digitalocean.com/community/tutorials/how-to-use-node-js-request-and-cheerio-to-set-up-simple-web-scraping
   * cheerio has had 58 releases, most recent was 3 months ago
   * request has had 115 releases, most recent was 1 week ago 
   * cheerio has 1,025 commits, 81 contributors, and 10,273 stars on github
   * request has 2,108 commits, 265 contributors, and 13,132 stars on github
 */
var cheerio = require("cheerio");
var request = require("request");
var fs = require("fs");
/** 
 * use fast-csv package for writing to csv - chose because:
   * has had 36 releases, most recent was 2 months ago
   * 148 commits, 26 contributors, and 304 stars on github
   * docs were clear and had example i could follow to write to csv
   * investigated the csv package too which is more popular 
     * but it wasn't immediately clear to me how to use it for what i wanted
 */
var csv = require("fast-csv");

var rootUrl = "http://www.shirts4mike.com/";
var now = new Date();

scrapeSiteAndSaveData();

 /** main function that scrapes the site and saves the data as a csv */
function scrapeSiteAndSaveData() {
  makeDataDir();

  var csvStream = csv.format({ headers: true });
  var writableStream = fs.createWriteStream(csvPath());
  csvStream.pipe(writableStream);

  scrapeMainSite(csvStream);
}

/** create "data" directory if one doesn't already exist */
function makeDataDir() {
  if (!fs.existsSync("data")) {
    fs.mkdirSync("data");
  }
}

/** path for csv file in data directory with today's date as file name */
function csvPath() {
  var todayDate = now.toISOString().slice(0,10);
  return "data/" + todayDate + ".csv";
}

/**
 * visit the main t-shirt site and loop through the t-shirts,
 * visiting each t-shirt's individual site scraping the data from each
 */
function scrapeMainSite(csvStream) {
  request(rootUrl, function(error, response, html) {
    if (!error && response.statusCode === 200) {
      var $ = cheerio.load(html);
      $(".products li a").each(function() {
        var shirtPath = $(this).attr("href");

        scrapeShirtSite(shirtPath, csvStream);
      });
    } else {
      handleError(error);
    }
  });
}

/**
 * scrape the data from an individual t-shirt's site
 * and write its data to the csv
 */
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
        URL: shirtUrl,
        Time: now.toISOString().slice(11,19)
      };

      csvStream.write(metadata);
    } else {
      handleError(error);
    }
  });
}

/** log error to console and append to error log w/timestamp */
function handleError(error) {
  var errorMessage = "There was an error visiting the website (" + error.code + ")";
  console.log(errorMessage);
  fs.appendFile("scraper-error.log", errorMessage + " - " + now + "\n");
}
