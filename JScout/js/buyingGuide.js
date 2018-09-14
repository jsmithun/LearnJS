/*
 * @Author: Mohammad M. AlBanna
 * Copyright © 2018 Jungle Scout
 *
 * Get data from buying guide pages
*/

//If the file has injected many times
if($(".jsContainer").length >= 1){
    throw new Error("Injected!");
}

getBuyingGuideProductFirstPage = function (){
	var products = $("ul.s-result-list:first li.s-result-item");
	var buyingGuideName =$("#intro h1.buying-guide-questions-head-title").text();
	var resultsRow = $("#a-autoid-0:visible").length;
  	return {name:buyingGuideName, resultsRow:resultsRow, products:products, action:"buyingGuideProductFirstPage"};
}

getBuyingGuideProductOtherPage = function(callback){
	$(".buying-guide-results-featured input[type='submit']").get(0).click();
	setTimeout(function(){
		var checkProductsInterval = setInterval(function(){
			if($(".load-more-spinner-shadow:visible").length == 0){
				var products = $("ul.s-result-list:last li.s-result-item");
				var buyingGuideName =$("h1.buying-guide-questions-head-title").text();
				var resultsRow = $("#a-autoid-0:visible").length;
			  	var results = {name:buyingGuideName, resultsRow:resultsRow, products:products, action:"buyingGuideProductOtherPage"};
				callback.call(this,results);
				clearInterval(checkProductsInterval);
			}
		},10);
	},500);
}