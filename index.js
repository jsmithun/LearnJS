var lodash = require('lodash');
var request = require('request');
//console.log ("test");
console.log(lodash.defaults({ 'a': 1 }, { 'a': 3, 'b': 2 }));

request('https://www.amazon.com/s/ref=nav_ya_signin?url=search-alias%3Daps&field-keywords=bookshelf&sprefix=books%2Caps%2C151&crid=1UVAS7APW0NNT&', function (error, response, body) {
  console.log('error:', error); // Print the error if one occurred
  console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
  console.log('body:', body); // Print the HTML for the Google homepage.
});

