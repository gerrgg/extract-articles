/**
 * Author: Greg Bastianelli
 * Extract posts and conver to markdwon files
 */

// call local json file
const articles = require("./uta-showcase.json");

// makes the api calls to url
const axios = require("axios");
// traverse DOM for us
const cheerio = require("cheerio");

// lets us use the file system
const fs = require("fs");

// Converts html to markdown
const TurndownService = require("turndown");
const turndownService = new TurndownService();

// gets articles from json file, extracts data and converts to .md
const init = async () => {
  // Extract the article urls from the json file
  const urls = articles.map((article) => article.url);

  urls.forEach((url) => {
    buildMarkdownFromUrl(url);
  });
};

const buildMarkdownFromUrl = async (url) => {
  try {
    // save slug for article file name
    const slug = url.split("/").pop();

    // get the data
    const { data } = await axios.get(`${url}`);

    // get the content from the response
    const $ = cheerio.load(data);

    // extract the school, title and date for frontmatter
    const school = $("#content p.school").text();
    const title = $("#content h1").text().replace(":", "|");
    const date = $("#content div.publish_date p")
      .text()
      .replace("Published", "");

    // format the published date to yyyy-MM-dd
    const formattedDate = formatDate(date);

    // get article content
    const article = $("article").html();

    // create frontmatter
    const frontmatter =
      "--- \ntitle: " +
      title +
      "\ndate: " +
      formattedDate +
      "\ncategory: " +
      school +
      "\n---";

    // convert html to markdark
    const markdown = frontmatter + "\n\n" + turndownService.turndown(article);

    const writeTo = `./markdown/${slug}.md`;
    fs.writeFileSync(writeTo, markdown);

    console.log(`File successfully created at ${writeTo}`);
  } catch (e) {
    console.log("error", e.message);
  }
};

const formatDate = (date) => Date.parse(date);

init();
