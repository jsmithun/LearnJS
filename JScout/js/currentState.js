/**
 * @Author: Mohammad M. AlBanna
 * Copyright © 2018 Jungle Scout
 *
 * Save the current state of JS
 */

//If the file has injected many times
if($(".jsContainer").length >= 1){
    throw new Error("Injected!");
}


var currentState = function(url){

	var getCurrentAvgSales = function(){
		return $("section.jsContainer .summary-result.js-avg-sales").html();
	}

	var getCurrentAvgSalesRank = function(){
		return $("section.jsContainer .summary-result.js-avg-sales-rank").html();
	}

	var getCurrentAvgPrice = function(){
		return $("section.jsContainer .summary-result.js-avg-price").html();
	}

	var getCurrentAvgReviwes = function(){
		return $("section.jsContainer .summary-result.js-avg-reviews").html();
	}

	var getCurrentOppScore = function(){
		return $("section.jsContainer .summary-container.js-opp-score-container").html();
	}

	var getCurrentTable = function(){
		//Get back the rows colors
	    $("#js-table tbody tr").each(function(index){
	        let $tdNumber = $(this).find("td.js-number");
	        let currentTdNumber = $(this).hasClass("child-product") ? " " : $tdNumber.text();
	        currentTdNumber = currentTdNumber ? currentTdNumber : $(this).attr("id") == "0" ? "1" : $(this).attr("id");
	        $tdNumber.text(currentTdNumber);
	        $(this).css("background-color", "white");
	    });
		return $("section.jsContainer #js-table").html();
	}

	var getCurrentFirstRow = function(){
		return $("section.jsContainer #js-table").attr("data-firstRow");
	}

	var getCurrentExtractElement = function(){
		return $("section.jsContainer #extractResults").attr("data-section")
	}

	var getCurrentSearchTerm = function(){
		return $("section.jsContainer #js-table").attr("data-searchTerm");
	}

	var getExtractUrl = function(){
		return $("section.jsContainer #js-table").attr("data-extractUrl");
	}

	var saveCurrentState = function(){
		var obj = {};
	    var key = "current_state";
	    obj[key] += "current_state";
	    obj[key] = JSON.stringify({
	    			currentUrl: url,
	    			currentAvgSales:getCurrentAvgSales(),
			    	currentAvgSalesRank:getCurrentAvgSalesRank(),
			    	currentAvgPrice:getCurrentAvgPrice(),
			    	currentAvgReviwes:getCurrentAvgReviwes(),
			    	currentOppScore:getCurrentOppScore(),
			    	currentTable:getCurrentTable(),
			    	currentExtractElement:getCurrentExtractElement(),
			    	currentExtractUrl:getExtractUrl(),
			    	currentFirstRow:getCurrentFirstRow(),
			    	currentSearchTerm:getCurrentSearchTerm(),
			    	lastScraped:Date.now()
			    });
	    chrome.storage.local.set(obj);
	    console.log("js_info: The current state just saved! " + Date.now());
	}

	return {
		saveCurrentState:saveCurrentState
	}
}// End currentState Module