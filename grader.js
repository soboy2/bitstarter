#!/usr/bin/env node

/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/


var fs = require('fs');
var rest = require('restler');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
  var instr = infile.toString();
  if(!fs.existsSync(instr)) {
    console.log("%s does not exist. Exiting.", instr);
    process.exit(1);
  }
  return instr;
};

var loadChecks = function(checksfile) {
  return JSON.parse(fs.readFileSync(checksfile)).sort();
};

var checkHtml = function(html, checks) {
  $ = cheerio.load(html);
  var out = {};
  for(var ii in checks) {
    var present = $(checks[ii]).length > 0;
    out[checks[ii]] = present;
  }
  return out;
};

var checkHtmlFile = function(htmlfile, checks) {
  return checkHtml(fs.readFileSync(htmlfile), checks);
};

// var cheerioHtmlFile = function(htmlfile) {
//   return cheerio.load(fs.readFileSync(htmlfile));
// };

var download = function(url, callback) {
  var resp = rest.get(url);
  resp.on('complete', function(result) {
    if(result instanceof Error) {
      sys.puts('Error: ' + result.message);
      this.retry(5000);
      return;
    }
    callback(null, result);
  });
};



var clone = function(fn) {
  // http://stackoverflow.com/a/6772648
  return fn.bind({});
};

if(require.main == module) {
  program
    .option('-c, --checks <check_file>', 'Path to checks.json',
      clone(assertFileExists), CHECKSFILE_DEFAULT)
    .option('-f, --file <html_file>', 'Path to index.html',
      clone(assertFileExists), HTMLFILE_DEFAULT)
    .option('-u, --url <url>', 'Path to download url')
    .parse(process.argv);

  var check = function(err, html) {
      if(err) {
        console.log('Error getting html: ' + err);
        process.exit(1);
      }

      var checks = loadChecks(program.checks);
      var checkJson = checkHtml(html, checks);
      var outJson = JSON.stringify(checkJson, null, 4);
      console.log(outJson);
  };

  if(program.url) {
    download(program.url, check);
  } else if(program.file) {
    fs.readFile(program.file, check);
  }

} else {
  exports.loadChecks = loadChecks;
  exports.checkHtmlFile = checkHtmlFile;
}
