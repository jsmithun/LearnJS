// var lodash = require('lodash');
// var request = require('request');
var axios = require('axios');
var config = require('./config');

axios({
  method: 'post',
  url: 'https://junglescoutpro.herokuapp.com/api/v1/users/initial_authentication',
  data: { username: config.username, password: config.password, app: "jsl" },
}).then(function (response) {
  console.log(response.data.daily_token);

})
  .catch(function (error) {
    console.log(error);
  });