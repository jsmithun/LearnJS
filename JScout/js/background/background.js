/**
 * @Author: Mohammad M. AlBanna
 * Copyright © 2018 Jungle Scout
 *
 * The background of the extension
 */

 //review-junglescout.herokuapp.com
 //junglescoutpro.herokuapp.com

//Constants
CHECK_SCRAPED_DATA_EACH_MS = 600000; //In milliseconds = 10 mins
CLEAR_SCRAPED_DATA_EACH_M = 20; //In minutes = 20 mins
CHECK_USER_EXISTENCE_EACH_MS = 10800000; //In hours = 3 hours

//General
lastXMLRequests = [];
$.ajaxSetup({
    timeout: 60000,
    error: function(jqXHR, textStatus, errorThrown) {
        stopAllAjaxRequests();
    }
});

//All supported stores
var supportedStoresList = ["*://www.amazon.com/*", "*://www.amazon.co.uk/*", "*://www.amazon.ca/*", "*://www.amazon.fr/*", "*://www.amazon.de/*", "*://www.amazon.in/*", "*://www.amazon.com.mx/*", "*://www.amazon.it/*", "*://www.amazon.es/*"];
var supportedStoresRegex = /(amazon.com$)|(amazon.co.uk$)|(amazon.ca$)|(amazon.de$)|(amazon.fr$)/i;

//Optional stores to inject needed files
var optionalStoresRegex = /(amazon.in$)|(amazon.com.mx$)|(amazon.it$)|(amazon.es$)/i;
var requestedStores = [];
//----------------------------------------------------------------------------------//
//Connection between injected scripts and background to make requests to Amazon
chrome.runtime.onConnect.addListener(function(port) { 
    if(port && port.name == "newPermissionRequested"){
        //On the popup is closed, refresh amazon pages
        port.onDisconnect.addListener(function(port) { 
            refreshAmazonPages();
        });
    }
});

//----------------------------------------------------------------------------------//
checkExistence();
//Auto check existense every 3 hours
setInterval(checkExistence, CHECK_USER_EXISTENCE_EACH_MS);
//----------------------------------------------------------------------------------//
//Auto check the lastScraped URL
setInterval(checkLastScraped, CHECK_SCRAPED_DATA_EACH_MS);
//---------------------------------------------------------------------------------//
//Google Analytics
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-52913301-8']);
_gaq.push(['_trackPageview','background.js']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();
//----------------------------------------------------------------------------------//
// Check settings for first time/update time
chrome.runtime.onInstalled.addListener(function(details){
    //Appply this if the extension is updated
    if(details.reason == "update"){
        //Refresh Amazon pages
        refreshAmazonPages();
    }
});
//----------------------------------------------------------------------------------//
// Refresh Amazon pages, Google Analytics, make requests to amazon pages
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    // Waiting a message to refresh all Amazon pages
    if (request.action == "refreshAmazonPages"){
        //Refresh Amazon pages
        refreshAmazonPages();
    }else if(request.action == "googleAnalyticsAction" && typeof request.page != "undefined"){
        _gaq.push(['_trackPageview',request.page]);
    } else if(request.action == "makeRequest" && typeof request.link != "undefined"){
        var XMLRequest = $.ajax({
            type: "GET",
            dataType: "text",
            url: request.link,
            success: function(data, textStatus) {
                //Product data
                var myHTML = insertDocument(data);
                var parser = new Parser(myHTML);
                sendResponse({
                    data: data,
                    getProductTitle: parser.getProductTitle(), 
                    getProductImage: parser.getProductImage(),
                    getBrand: parser.getBrand(request.passingData),
                    getPrice: parser.getPrice(request.passingData),
                    isPrime: parser.isPrime(request.passingData),
                    getRankAndCategory: parser.getRankAndCategory(request.bestSellerRankText),
                    getBbSeller: parser.getBbSeller(),
                    getReviews: parser.getReviews(),
                    getRating: parser.getRating()
                });
            }, 
            error: function(jqXHR, textStatus, errorThrown){
                console.log(textStatus);
            }
        });
        lastXMLRequests.push(XMLRequest);
        //Async
        return true;
    } else if(request.action == "stopAllAjaxRequests"){
        stopAllAjaxRequests();
    } 
    //If I really have the html data
    else if(request.action == "makeDataParse" && typeof request.htmlPage != "undefined"){ 
        var theHTML = insertDocument(request.htmlPage);
        var parser = new Parser(theHTML);
        sendResponse({
            getProductTitle: parser.getProductTitle(), 
            getProductImage: parser.getProductImage(),
            getBrand: parser.getBrand(request.passingData),
            getPrice: parser.getPrice(request.passingData),
            isPrime: parser.isPrime(request.passingData),
            getRankAndCategory: parser.getRankAndCategory(request.bestSellerRankText),
            getBbSeller: parser.getBbSeller(),
            getReviews: parser.getReviews(),
            getRating: parser.getRating()
        });
    }
});

//----------------------------------------------------------------------------------//
//Check if the user exist
function checkExistence(){
    chrome.storage.local.get("auth",function(result){
        if(Object.keys(result).length === 0){
            return false;
        }

        //Auto check existense
        result = JSON.parse(result.auth);
        $.get("https://junglescoutpro.herokuapp.com/api/v1/users/authenticate?username="+encodeURIComponent(result.username),function(response){
            if(response && !response.status){
                chrome.storage.local.remove("auth");
                return false;
            }else{
                //Save last checked date
                result.last_checked = Date.now();
                console.log("js_info: Renewed at "+ result.last_checked);
                result.daily_token = typeof response.daily_token != "undefined" ? $.trim(response.daily_token) : "";
                result.nickname = response.nickname;
                result.email = response.email;
                result = JSON.stringify(result);
                var obj = {};
                var key = "auth";
                obj[key] += "auth";
                obj[key] = result;
                chrome.storage.local.set(obj);
            }
        }, "json");
    });
}//end checkExistence 

//----------------------------------------------------------------------------------//
//Remove last scraped data
function checkLastScraped(){
    chrome.storage.local.get(["current_state"],function(result){ 
        if(Object.keys(result).length > 0){
            var lastScraped = JSON.parse(result.current_state).lastScraped;
            var timeDiff = new TimeDiff(lastScraped);
            if(timeDiff.getDiffMins() >= CLEAR_SCRAPED_DATA_EACH_M){
                chrome.storage.local.remove("current_state");
            }
        }
    });
}

//----------------------------------------------------------------------------------//
//Get the time of last scraped data
function TimeDiff(lastScraped) {
    var now = new Date();    
    var lastScrapedTime = new Date(lastScraped);

    var getDiffInMins = function() {
        return (now - lastScrapedTime) / 1000 / 60;
    };

    var getDiffMins = function() {
        return Math.round(getDiffInMins() % 60);
    };

    var getDiffInHrs = function() {
        return Math.floor(getDiffInMins() / 60);
    };

    return {
        getDiffMins:getDiffMins,
        getDiffInHrs:getDiffInHrs
    };
}

//----------------------------------------------------------------------------------//
//Refresh All Amazon Pages
function refreshAmazonPages(){
	chrome.tabs.query({ url: supportedStoresList}, function(tabs){	
	    for(var i = 0; i < tabs.length; i++)
	    {	
	    	chrome.tabs.reload(tabs[i].id);
	    }
	});
}

//----------------------------------------------------------------------------------//
//Stop all AjaxRequests that generated to Amazon products pages
function stopAllAjaxRequests(){
    if(lastXMLRequests.length > 0){
        $(lastXMLRequests).each(function(index, ajax) {
            ajax.abort();
            lastXMLRequests.splice(index, 1);
        });
        lastXMLRequests = [];
    }
}

//----------------------------------------------------------------------------------//
function insertDocument (myHTML) {
    var newHTMLDocument = document.implementation.createHTMLDocument().body;
    newHTMLDocument.innerHTML = myHTML;
    [].forEach.call(newHTMLDocument.querySelectorAll("script, style, img:not(#landingImage):not(#imgBlkFront):not(#main-image):not(.a-dynamic-image):not(.frontImage)"), function(el) {el.remove(); });
    return $(newHTMLDocument.innerHTML);
}

//----------------------------------------------------------------//
//When the tab is changed, check if the user has a permission to optional stores and inject needed files
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab){
    let domainURL = getDomain(tab.url);
    if(optionalStoresRegex.test(domainURL) && changeInfo.status == "loading"){
        requestedStores = domainURL == "amazon.in" ? ["*://www.amazon.in/*"] : domainURL == "amazon.com.mx" ? ["*://www.amazon.com.mx/*"] : domainURL == "amazon.it" ?  ["*://www.amazon.it/*"] : ["*://www.amazon.es/*"];
        chrome.permissions.contains({
            origins: requestedStores
        }, function(result) {
            if (result) {
                //Inject files
                injectFiles(tab);
            }
        });
    }
});
//----------------------------------------------------------------//
//Inject needed files for optional stores
function injectFiles(tab){
    chrome.tabs.insertCSS(tab.id, {file: "css/jsPopup.css"});
    chrome.tabs.executeScript(tab.id, {file: "js/libraries/jquery.js"});
    chrome.tabs.executeScript(tab.id, {file: "js/libraries/enscroll.js"});
    chrome.tabs.executeScript(tab.id, {file: "js/libraries/jquery.tablesorter.js"});
    chrome.tabs.executeScript(tab.id, {file: "js/libraries/jquery.stickytableheaders.js"});
    chrome.tabs.executeScript(tab.id, {file: "js/libraries/table2csv.js"});
    chrome.tabs.executeScript(tab.id, {file: "js/libraries/plotly.js"});
    chrome.tabs.executeScript(tab.id, {file: "js/regexer.js"});
    chrome.tabs.executeScript(tab.id, {file: "js/common.js"});
    chrome.tabs.executeScript(tab.id, {file: "js/sharePopup.js"});
    chrome.tabs.executeScript(tab.id, {file: "js/currentState.js"});
    chrome.tabs.executeScript(tab.id, {file: "js/sellerPage.js"});
    chrome.tabs.executeScript(tab.id, {file: "js/buyingGuide.js"});
    chrome.tabs.executeScript(tab.id, {file: "js/wordsCloud.js"});
    chrome.tabs.executeScript(tab.id, {file: "js/libraries/html2canvas.js"});
    chrome.tabs.executeScript(tab.id, {file: "js/libraries/watermark.js"});
    chrome.tabs.executeScript(tab.id, {file: "js/jsPopup.js"});
}

//----------------------------------------------------------------//
function getDomain(url) {
    url = url.replace(/https?:\/\/(www.)?/i, '');
    if (url.indexOf('/') === -1) {
        return url;
    }
    return url.split('/')[0];
}
