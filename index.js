// call local json file
const articles = require("./uta-showcase.json");

// makes the api calls to url
const axios = require("axios");
// traverse DOM for us
const cheerio = require("cheerio");

const fs = require("fs");

const TurndownService = require("turndown");
const turndownService = new TurndownService();

const init = async () => {
  const urls = articles.map((article) => article.url);

  urls.forEach(async (url) => {
    try {
      // get the slug from url
      const slug = url.split("/").pop();

      // get the data
      const { data } = await axios.get(`${url}`);

      // get the content div
      const $ = cheerio.load(data);

      // extra school, title and date for frontmatter
      const school = $("#content p.school").text();
      const title = $("#content h1").text().replace(":", "|");
      const date = $("#content div.publish_date p")
        .text()
        .replace("Published", "");

      // get article content
      const article = $("article").html();

      // create frontmatter
      const frontmatter =
        "--- \ntitle: " +
        title +
        "\ndate:" +
        date +
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
  });
};

init();
