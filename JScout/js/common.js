/**
 * @Author: Mohammad M. AlBanna
 * Copyright © 2018 Jungle Scout
 * 
 * Contains the common and pupblic functions to use
 */

//If the file has injected many times
if($(".jsContainer").length >= 1){
    throw new Error("Injected!");
}

//--------------------------------------------------------------------------------//
function updateParameter(uri, key, value) {
    var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
    var separator = uri.indexOf('?') !== -1 ? "&" : "?";
    if (uri.match(re)) {
        return uri.replace(re, '$1' + key + "=" + value + '$2');
    } else {
        return uri + separator + key + "=" + value;
    }
}

//--------------------------------------------------------------------------------//
function escapeHTML(s) {
    return s != null ? s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;').trim() : "";
}

//--------------------------------------------------------------------------------//
function getParameter(name, url) {
    var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(url);
    return results ? results[1] : null;
}

//--------------------------------------------------------------------------------//
//Show no products screen
function showNoProductsScreen() {
    $("section.jsContainer #js-table").css("display", "none");
    $("section.jsContainer #extractResults, section.jsContainer #sharePopup, section.jsContainer #trendPopup, section.jsContainer #wordsCloudPopup").addClass("js-inactive-btn-footer");
    $("section.jsContainer .main-screen").css("display", "block");
    $("section.jsContainer .content-table").css("background-color", "white");
    $("section.jsContainer #trendPopup").attr("data-tooltip", notActiveTrendBtn);
}

//--------------------------------------------------------------------------------//
//To center any visible popup window in the screen
function centerThePopups(popupSelector){
    let $currentPopup = typeof popupSelector == "undefined" || popupSelector == null ? $(".js-popup-window:visible") : popupSelector;
    $currentPopup.css({
            "left": ($("section.container").innerWidth() - $currentPopup.innerWidth())/2, 
            "top": (($("section.container").innerHeight() - $currentPopup.innerHeight())/2)
        });
    return $currentPopup;
}

//--------------------------------------------------------------------------------//
//Show products screen, that will show the tables and footer section in injected JS popup 
function showProductsScreen() {
    //Show next page
    if($("#js-table").attr("data-extractUrl")){
        $("section.jsContainer #extractResults").removeClass("js-inactive-btn-footer");
    }else{
        $("section.jsContainer #extractResults").addClass("js-inactive-btn-footer");
    }

    $("#js-table").attr("data-searchTerm") ? $("section.jsContainer #trendPopup").attr("data-tooltip", activeTrendBtn).removeClass("js-inactive-btn-footer") : $("section.jsContainer #trendPopup").addClass("js-inactive-btn-footer").attr("data-tooltip", notActiveTrendBtn);
    $("section.jsContainer .main-screen").css("display","none");
    $("section.jsContainer #sharePopup, section.jsContainer #wordsCloudPopup").removeClass("js-inactive-btn-footer");
    $("section.jsContainer #js-table").fadeIn();
    $("section.jsContainer .center-footer").css("display", "inline-block");
}

//--------------------------------------------------------------------------------//
//Sort table based on its id
function sortTable(table) {
    var store = [];
    for (var i = 0, len = table.rows.length; i < len; i++) {
        var row = table.rows[i];
        var sortnr = parseInt(row.id);
        if (!isNaN(sortnr)) store.push([sortnr, row]);
    }
    store.sort(function(x, y) {
        return x[0] - y[0];
    });

    let childrenLength = $("section.jsContainer #js-table tr.child-product").length;
    for (var i = 0, len = store.length; i < len; i++) {
        $(store[i][1]).not('.child-product, .parent-product').find("td:first").text((i - childrenLength) + 1);
        $("section.jsContainer #js-table tbody").append($(store[i][1]).get(0));
    }
    store = null;
}

//--------------------------------------------------------------------------------//
//Add comma
function numberWithCommas(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

//--------------------------------------------------------------------------------//
//Clean previous data of JS
function cleanJsPopup(){
    $("#js-table tbody tr").remove();
    $(".summary-result.js-avg-sales").html("<i class='none-info'>--</i>");
    $(".summary-result.js-avg-sales-rank").html("<i class='none-info'>--</i>");
    $(".summary-result.js-avg-price").html("<i class='none-info'>--</i>");
    $(".summary-result.js-avg-reviews").html("<i class='none-info'>--</i>");
    $(".header .summary-result.js-no-opp-score").css("display", "block");
    reInitializeTableSorter(false);
}

//--------------------------------------------------------------------------------//
//To initial table sorter library
function reInitializeTableSorter(init) {
    $('section.jsContainer #js-table').stickyTableHeaders("destroy");
    $("section.jsContainer #js-table").trigger("destroy");
    if(init){
        $("section.jsContainer #js-table").tablesorter({
        cssIcon: 'tablesorter-icon',
        initialized : function(table){
            $(table).find('thead .tablesorter-header-inner .tablesorter-icon').length == 0 ? $(table).find('thead .tablesorter-header-inner').append('<i class="tablesorter-icon"></i>') : null;
        },
        textExtraction: function (node) {
                var txt = $(node).text();
                txt = txt.replace('N.A.', '');
                txt = txt.replace('hmm...', '');
                return txt;
            }
        });
        currentScrollPosition = $('section.jsContainer .content-table').scrollTop();
        $('section.jsContainer .content-table').scrollTop(0);
        $('section.jsContainer #js-table').stickyTableHeaders({container: "section.jsContainer .content-table"});
        $('section.jsContainer .content-table').scrollTop(currentScrollPosition);  
    }
}
//--------------------------------------------------------------------------------//
//Use sync storage
function syncStorage(key, value, callback) {
    var obj = {};
    var key = key;
    obj[key] += key;
    obj[key] = value;
    if(callback){
        chrome.storage.sync.set(obj,function(){
            callback.call(this);
        });
    }else{
        chrome.storage.sync.set(obj);
    }
}

//--------------------------------------------------------------------------------//
//Use local storage
function localStorage(key, value, callback) {
    var obj = {};
    var key = key;
    obj[key] += key;
    obj[key] = value;
    if(callback){
        chrome.storage.local.set(obj,function(){
            callback.call(this);
        });
    }else{
        chrome.storage.local.set(obj);
    }
}

//--------------------------------------------------------------------------------//
//return just any number
function pureNumber(number){
    if(number && typeof number == "string"){
        number = number.match(/[0-9.]/g);
        number = number ? number.join("") : "N.A.";
        return !isNaN(number) ? number : "N.A.";
    }else if(!isNaN(number) && typeof number == "number"){
        return number;
    }
    else{
        return "N.A.";
    }
}

//----------------------------------------------------//
//Render all header boxes
var renderHeaderBoxes = function(justVisible){
    //Current results
    var $neededRows = null;
    if(typeof justVisible != "undefiend" && justVisible){
        $neededRows = $("#js-table tbody tr:visible");
    } else {
        $neededRows = $("#js-table tbody tr:visible, #js-table tbody tr.child-product");
    }
    
    //Get average variables
    var sales = 0;
    var salesAvg = 0;
    var salesCounter = 0;

    var rank = 0;
    var rankAvg = 0;
    var rankCounter = 0;

    var price = 0;
    var priceAvg = 0;
    var priceCounter = 0;

    var reviews = 0;
    var reviewsAvg = 0;
    var reviewsCounter = 0;

    //Get average Sales
    if($neededRows.length > 0){
        $neededRows.each(function(index, val) {
            //Sales average
            sales = $(val).attr("data-estsales");
            if(sales && !isNaN(sales)){
                sales = parseInt(sales);
                salesAvg = (salesAvg + sales);
                ++salesCounter;
            }

            //Rank average
            rank = $(val).attr("data-rank");
            if(rank && !isNaN(rank)){
                rank = parseInt(rank);
                rankAvg = (rankAvg + rank);
                ++rankCounter;
            }

            //Price average
            price = $(val).attr("data-price");
            if(price && !isNaN(price)){
                price = parseFloat(price);
                priceAvg = (priceAvg + price);
                ++priceCounter;
            }

            //Reviews average
            reviews = $(val).attr("data-reviews");
            if(reviews && !isNaN(reviews)){
                reviews = parseInt(reviews);
                reviewsAvg = (reviewsAvg + reviews);
                ++reviewsCounter;
            }
        }); //End for loop

        //Avg est. sales
        var salesAvg = salesAvg/salesCounter;
        salesAvg = Math.round(salesAvg.toFixed(2));
        if(!isNaN(salesAvg)){
            salesAvg = numberWithCommas(salesAvg);
            $(".summary-result.js-avg-sales").text(salesAvg).attr("title", salesAvg);
        }

        //Avg Rank
        var rankAvg = rankAvg/rankCounter;
        rankAvg = Math.round(rankAvg.toFixed(2));
        if(!isNaN(rankAvg)){
            rankAvg = numberWithCommas(rankAvg);
            $(".summary-result.js-avg-sales-rank").text(rankAvg);
        }

        //Avg Prices
        var priceAvg = priceAvg/priceCounter;
        if(!isNaN(priceAvg)){
            priceAvg = numberWithCommas(priceAvg.toFixed(2));
            $(".summary-result.js-avg-price").text(currentCurrency+priceAvg);
        }

        //Avg Reviews
        var reviewsAvg = reviewsAvg/reviewsCounter;
        reviewsAvg = Math.round(reviewsAvg.toFixed(2));
        if(!isNaN(reviewsAvg)){
            reviewsAvg = numberWithCommas(reviewsAvg);
            $(".summary-result.js-avg-reviews").text(reviewsAvg);   
        }

        $("body").trigger("onTableRowChanged", justVisible);
    } else{
        $(".summary-result.js-avg-sales").html("<i class='none-info'>--</i>");
        $(".summary-result.js-avg-sales-rank").html("<i class='none-info'>--</i>");
        $(".summary-result.js-avg-reviews").html("<i class='none-info'>--</i>");
        $(".summary-result.js-avg-price").html("<i class='none-info'>--</i>");
    }
}
//--------------------------------------------------------------------------------//
//Convert all paramaters from url to array
function URLParamatersToArray(url) {
    var request = [];
    var pairs = url.substring(url.indexOf('?') + 1).split('&');
    for (var i = 0; i < pairs.length; i++) {
        if(!pairs[i])
            continue;
        var pair = pairs[i].split('=');
        request.push(decodeURIComponent(pair[0]));
    }
    return request;
}

//--------------------------------------------------------------------------------//
//Responsible to get next pages of Amazon
function Pagination(resultsRow){
    var allResultsNumber = 0;
    var currentPage = 1;
    var nextResult = "N.A.";

    if(resultsRow){
        //All results number
        allResultsNumber = $(resultsRow).find(".pagnDisabled:last").text();
        if(allResultsNumber.length === 0){
            allResultsNumber = $(resultsRow).find(".pagnLink:last").text();
        }

        //Current page
        currentPage = $(resultsRow).find(".pagnCur:last").text();

        //Nect Result
        nextResult = $(resultsRow).find(".pagnCur:last").next().text();
    }

    var getAllResultsNumber = function (){
        return allResultsNumber;
    }
    var getCurrentPage = function(){
        return currentPage;
    }
    var getNextResult = function(){
        return nextResult;
    }

    return{
        getAllResultsNumber:getAllResultsNumber,
        getCurrentPage:getCurrentPage,
        getNextResult:getNextResult
    }
}

//--------------------------------------------------------------------------------//
//Hide all opened popups, either true or selector string
function hidePopups(){
    $(".js-share-popup:visible, .js-floating-message:visible, .js-product-history-popup:visible, .js-words-cloud-popup:visible").find(".close-popup-icon").parent().click();
    $("section.jsContainer .container").removeClass("invisible-container");
    //Remove the tooltip
    $("p.jsToolTip").remove();
    //Get back the rows colors | Check save current state as well
    $("#js-table tbody tr").each(function(index){
        let $tdNumber = $(this).find("td.js-number");
        let currentTdNumber = $(this).hasClass("child-product") ? " " : $tdNumber.text();
        currentTdNumber = currentTdNumber ? currentTdNumber : $(this).attr("id") == "0" ? "1" : $(this).attr("id");
        $tdNumber.text(currentTdNumber);
        $(this).css("background-color", "white");
    });
}

//---------------------------------------------------------------//
function showPopUpMessage(title, message){
    $("section.jsContainer .container").addClass("invisible-container");
    $(".js-floating-message h2").html(stripScriptTags(title)); 
    if(typeof message != "undefined"){
        message = stripScriptTags(message);
        message = message ? message : "";
        $(".js-floating-message div.js-message-content").html(message);    
    } else {
        $(".js-floating-message h2").addClass("js-remove-margins");
    }

    //Position the popup to center
    centerThePopups($(".js-floating-message"));

    //Show it
    $(".js-floating-message").fadeIn();
}

//---------------------------------------------------------------//
function getASINFromURL(productUrl){
    productUrl = decodeURIComponent(productUrl);
    let asin = "N.A.";
    asin = productUrl.match(asinRegex);
    asin = asin ? asin[0].replace(/(dp\/)|(ASIN\/)|(product\/)|(\/)/ig,"") : null;
    return asin;
}

//---------------------------------------------------------------//
//Enable/disable the inputs based on activated columns
function refreshDefaultDrawer(){
    //Load user data from the storage
    chrome.storage.local.get(["auth", "profileImg"], function(result){
        if(typeof result.auth != "undefined"){ 
            let userDetails = JSON.parse(result.auth);
            let userNickname = typeof userDetails.nickname != "undefined" && userDetails.nickname.length != 0 ? userDetails.nickname : "";
            let userEmail = typeof userDetails.email != "undefined" && userDetails.email.length != 0 ? userDetails.email : "";
            let theDataURLImg = typeof result.profileImg != "undefined" ? result.profileImg : null;
            $("section.jsContainer .profile-details .profile-username").text(userNickname).attr("title", userNickname);
            $("section.jsContainer .profile-details .profile-email").text(userEmail).attr("title", userEmail);
            if(theDataURLImg){
                $("section.jsContainer .profile-image span").css("background-image", "url('" + theDataURLImg + "')");
            }
        }
    });
}

//---------------------------------------------------------------//
function stripScriptTags(theCode){
    theCode = theCode && typeof theCode == "string" ? theCode.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/ig,"") : null;
    return theCode;
}

//---------------------------------------------------------------//
/* JavaScript Client Detection
* (C) viazenetti GmbH (Christian Ludwig)
* Source: http://jsfiddle.net/ChristianL/AVyND/
*/
function getClientInfo() {
    var unknown = '-';

    // screen
    var screenSize = '';
    if (screen.width) {
        width = (screen.width) ? screen.width : '';
        height = (screen.height) ? screen.height : '';
        screenSize += '' + width + " x " + height;
    }

    // browser
    var nVer = navigator.appVersion;
    var nAgt = navigator.userAgent;
    var browser = navigator.appName;
    var version = '' + parseFloat(navigator.appVersion);
    var majorVersion = parseInt(navigator.appVersion, 10);
    var nameOffset, verOffset, ix;

    // Chrome
    if ((verOffset = nAgt.indexOf('Chrome')) != -1) {
        browser = 'Chrome';
        version = nAgt.substring(verOffset + 7);
    }
    // Other browsers
    else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) < (verOffset = nAgt.lastIndexOf('/'))) {
        browser = nAgt.substring(nameOffset, verOffset);
        version = nAgt.substring(verOffset + 1);
        if (browser.toLowerCase() == browser.toUpperCase()) {
            browser = navigator.appName;
        }
    }
    // trim the version string
    if ((ix = version.indexOf(';')) != -1) version = version.substring(0, ix);
    if ((ix = version.indexOf(' ')) != -1) version = version.substring(0, ix);
    if ((ix = version.indexOf(')')) != -1) version = version.substring(0, ix);

    // cookie
    var cookieEnabled = (navigator.cookieEnabled) ? true : false;

    if (typeof navigator.cookieEnabled == 'undefined' && !cookieEnabled) {
        document.cookie = 'testcookie';
        cookieEnabled = (document.cookie.indexOf('testcookie') != -1) ? true : false;
    }

    // system
    var os = unknown;
    var clientStrings = [
        {s:'Windows 10', r:/(Windows 10.0|Windows NT 10.0)/},
        {s:'Windows 8.1', r:/(Windows 8.1|Windows NT 6.3)/},
        {s:'Windows 8', r:/(Windows 8|Windows NT 6.2)/},
        {s:'Windows 7', r:/(Windows 7|Windows NT 6.1)/},
        {s:'Windows Vista', r:/Windows NT 6.0/},
        {s:'Windows Server 2003', r:/Windows NT 5.2/},
        {s:'Windows XP', r:/(Windows NT 5.1|Windows XP)/},
        {s:'Windows 2000', r:/(Windows NT 5.0|Windows 2000)/},
        {s:'Windows ME', r:/(Win 9x 4.90|Windows ME)/},
        {s:'Windows 98', r:/(Windows 98|Win98)/},
        {s:'Windows 95', r:/(Windows 95|Win95|Windows_95)/},
        {s:'Windows NT 4.0', r:/(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/},
        {s:'Windows CE', r:/Windows CE/},
        {s:'Windows 3.11', r:/Win16/},
        {s:'Android', r:/Android/},
        {s:'Open BSD', r:/OpenBSD/},
        {s:'Sun OS', r:/SunOS/},
        {s:'Linux', r:/(Linux|X11)/},
        {s:'iOS', r:/(iPhone|iPad|iPod)/},
        {s:'Mac OS X', r:/Mac OS X/},
        {s:'Mac OS', r:/(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/},
        {s:'QNX', r:/QNX/},
        {s:'UNIX', r:/UNIX/},
        {s:'BeOS', r:/BeOS/},
        {s:'OS/2', r:/OS\/2/},
        {s:'Search Bot', r:/(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/}
    ];
    for (var id in clientStrings) {
        var cs = clientStrings[id];
        if (cs.r.test(nAgt)) {
            os = cs.s;
            break;
        }
    }

    var osVersion = unknown;

    if (/Windows/.test(os)) {
        osVersion = /Windows (.*)/.exec(os)[1];
        os = 'Windows';
    }

    switch (os) {
        case 'Mac OS X':
            osVersion = /Mac OS X (10[\.\_\d]+)/.exec(nAgt)[1];
            break;

        case 'Android':
            osVersion = /Android ([\.\_\d]+)/.exec(nAgt)[1];
            break;

        case 'iOS':
            osVersion = /OS (\d+)_(\d+)_?(\d+)?/.exec(nVer);
            osVersion = osVersion[1] + '.' + osVersion[2] + '.' + (osVersion[3] | 0);
            break;
    }
    

    window.jscd = {
        screen: screenSize,
        browser: browser,
        browserVersion: version,
        browserMajorVersion: majorVersion,
        os: os,
        osVersion: osVersion,
        cookies: cookieEnabled,
        userAgent: navigator.userAgent
    };

    return jscd;
}

//---------------------------------------------------------------//
//Go to URL with form data
function goToUrl(path, params, method) {
    //Null check
    method = method || "post"; // Set method to post by default if not specified.
    var form = document.createElement("form");
    form.setAttribute("method", method);
    form.setAttribute("action", path);

    //Fill the hidden form
    if (typeof params === 'string') {
        var hiddenField = document.createElement("input");
        hiddenField.setAttribute("type", "hidden");
        hiddenField.setAttribute("name", 'data');
        hiddenField.setAttribute("value", params);
        form.appendChild(hiddenField);
    }
    else {
        for (var key in params) {
            if (params.hasOwnProperty(key)) {
                var hiddenField = document.createElement("input");
                hiddenField.setAttribute("type", "hidden");
                hiddenField.setAttribute("name", key);
                if(typeof params[key] === 'object'){
                    hiddenField.setAttribute("value", JSON.stringify(params[key]));
                }
                else{
                    hiddenField.setAttribute("value", params[key]);
                }
                form.appendChild(hiddenField);
            }
        }
    }

    document.body.appendChild(form);
    form.submit();
}

//---------------------------------------------------------------//
//A prototype to clean undefined/null/empty values
Array.prototype.clean=function(){return this.filter(function(e){return (typeof e !=='undefined')&&(e!= null)&&(e!='')})}
