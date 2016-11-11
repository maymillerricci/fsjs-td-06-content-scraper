var cheerio = require("cheerio");
var request = require("request");
var fs = require("fs");

// sync or non-sync versions of file methods??

if (!fs.existsSync("data")) {
  fs.mkdirSync("data");
}

var todayDate = new Date().toISOString().slice(0,10);
var csv_path = "data/" + todayDate + ".csv";
fs.writeFileSync(csv_path, "data");
