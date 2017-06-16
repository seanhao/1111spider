//1111爬蟲

var cheerio = require('cheerio'); //Jquery
var http = require('http');
var iconv = require('iconv-lite');//web decode
var mongo_url = 'mongodb://localhost:27017/blog';

var index = 1;
//文章url位置
var url = 'http://www.1111.com.tw/job/';
var articles = [];

function getArticle(url, i) {
  console.log("Get" + i + "Job");
  //文章url順序
  http.get(url + (79923999 - i) +'/', function(sres) {
    var chunks = [];
    sres.on('data', function(chunk) {
      chunks.push(chunk);
    });
    sres.on('end', function() {
      var html = iconv.decode(Buffer.concat(chunks), 'utf-8');
      var $ = cheerio.load(html, {decodeEntities: false});
      //mod
      $('#wrap').each(function (idx, element) {
        var $title = $('#commonTop h1').text();
        var $content = $('.dataList p').text();
        var $company = $('.navbar a').eq(0).text();
        var $city = $('.dataList dd').eq(1).text().slice(0,3);//slice縣市
        var $workplace = $('.dataList dd').eq(1).text().slice(3);
        var $worktime = $('.dataList dd').eq(2).text();
        var $holiday = $('.dataList dd').eq(3).text();
        var $content_type = $('.dataList dd').eq(4).text();
        var $category = $('.dataList dd').eq(5).text();//未使用
        var $salary = $('.dataList dd').eq(6).text();
        var $number = $('.dataList dd').eq(7).text();
        var $deadline = $('.dataList dd').eq(8).text();//未使用
        var $time = $('.dataList dd').eq(9).text(); 
        var $condition1 = $('.dataList dd').eq(10).text();
        var $condition2 = $('.dataList dd').eq(11).text(); 
        var $condition3 = $('.dataList dd').eq(12).text(); 
        var $condition4 = $('.dataList dd').eq(13).text(); 
        var $condition5 = $('.dataList dd').eq(14).text();
        var $other = $('.dataList dd').eq(15).text();
        var $contact = $('#block3 dd').text();
        articles.push({
          title: $title,
          author: "System",
          company: $company,
          content: $content_type+$content,
          condition: "身份類別:"+$condition1+
                   "\r\n學歷限制:"+$condition2+
                   "\r\n科系限制:"+$condition3+
                   "\r\n工作經驗:"+$condition4+
                   "\r\n語言能力:"+$condition5,
          city: $city,
          workplace: $workplace,
          worktime: $worktime,
          holiday: $holiday,
          salary: $salary,
          number: $number,
          contact: $contact,
          other: $other,     //備註
          time: new Date(),
        })
      })  
      if(i < 15) {
        getArticle(url, ++index);
      } else {
        console.log(articles); 
        console.log("Get article successfully!!!");
        save();        
      }
    });
  });
}

function save() {
  var MongoClient = require('mongodb').MongoClient;
  MongoClient.connect(mongo_url, function (err, db) {
    if (err) {
      console.error(err);
      return;
    } else {
      console.log("Connect db successfully!!!");
      var collection = db.collection('articles');
      collection.insertMany(articles, function (err,result) {
        if (err) {
          console.error(err);
        } else {
          console.log("Save data successfully!!!");
        }
      })
      db.close();
    }
  });
}

function start() {
  console.log("Start!!!");
  getArticle(url, index);
}

start();
