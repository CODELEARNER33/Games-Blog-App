const cheerio = require("cheerio");
const { json } = require("express");
const { writeFile } = require("fs");
const fsPromise = require("fs/promises");
const { waitForDebugger } = require("inspector");
const path = require("path");

const jsonFilePath = path.join(process.cwd(), "./articles.json");

const url_1 = "https://www.gamespot.com/";
const url_2 = "https://www.thegamer.com/category/game-news/";

const getArticle1 = async () => {
  try {
    const fetch = (await import("node-fetch")).default;

    const response = await fetch(url_1);
    const html = await response.text();
    const $ = cheerio.load(html);

    const articles_array_1 = [];

    $(".promo-strip__item").each((i, el) => {
      //el => current element

      const title = $(el).find("h3").text();

      const img = $(el).find("img").attr("src");

      //URL for the article is Relative url
      const ar_url = $(el).find("a").attr("href");
      const article_url = `https://www.gamespot.com${ar_url}`; // => I can fetch this url to manipulate and get the content present within that url (evil smile)

      articles_array_1.push({
        title,
        img,
        article_url,
      });
    });

    return articles_array_1;
    
  } catch (error) {
    console.log(error);
  }
};

const getArticle2 = async () => {
  try {
    const fetch = (await import("node-fetch")).default;

    const response = await fetch(url_2);
    const html = await response.text();
    const $ = cheerio.load(html);

    const articles_array_2 = [];

    $(".display-card, .article, .small, .active-content").each((i, el) => {
      //el => current element

       //Removal of Extra white-space and multiple spaces
      const title = $(el).find('h5').text().trim().replace(/\s\s+/g, "")  //Title

      const img = $(el).find('img').attr('src');  //Image link

      let article_url = $(el).find('a , .dc-img-link').attr('href'); 
      article_url = `https://www.thegamer.com${article_url}`;               //Article Url
      
      articles_array_2.push({
        title,
        img,
        article_url
      })
      });

      return articles_array_2;
  
    } catch (error) {
    console.log(error);
  }
};

const updateArticles = async () => {

  try {
  
    const article1 = await getArticle1();
    const article2 = await getArticle2();

    //Merge the article from both sources
    const allArticles = {...article1 , ...article2};

    //Write the merges articles to the JSON File
    const articlesAsString = JSON.stringify(allArticles, null , 2);  //Beautify JSON with indentation
    await fsPromise.writeFile(jsonFilePath , articlesAsString);

    console.log("Articles as been updated!!")

  } catch (error) {
    console.log("Error in updating articles : " , error)
  }

}

module.exports = {
  updateArticles
};