/*
 * @Author: Mohammad M. AlBanna
 * Copyright © 2018 Jungle Scout
 * 
 * Contains the core of JS
*/

/** 
* Supported JS API stores:
* -----------------
* FR
* US
* UK
* CA
* IN
*/

//review-junglescout.herokuapp.com
//junglescoutpro.herokuapp.com

$(function(){
	//If the file has injected many times
	if($(".jsContainer").length >= 1){
		return;
	}

	//None info messages
	noneCategoryInfo = "<i data-tooltip='This listing does not have a parent category' class='none-info'>--i</i>";
	noneRankInto = "<i data-tooltip='Amazon does not rank this listing in a parent category, only sub-categories. In order to compare apples to apples, sub-category ranks are not displayed in this window' class='none-info'>--i</i>";
	noneBrandInfo = "<i data-tooltip='Amazon does not display a brand for this listing' class='none-info'>--i</i>";
	nonePriceInfo = "<i data-tooltip='This listing does not have a seller who controls the buy box' class='none-info'>--i</i>";
	noneReviewsInfo = "<span style='cursor: pointer' data-tooltip='This product does not yet have a review rating'>0</span>"
	noneRatingInfo = "<i data-tooltip='Amazon does not display the star rating for this product' class='none-info'>--i</i>";
	noneBBSellerInfo = "<i data-tooltip='No sellers currently control the buy box, therefore a seller type cannot be displayed' class='none-info toLeftToolTip'>--i</i>";
	noneEstSalesInfo = "<i data-tooltip='Monthly sales cannot be estimated for this product because Amazon does not rank it in a parent category. Unfortunately, sub-category ranks cannot provide accurate sales estimates, therefore should not be used by sellers to predict sales and are not used by Jungle Scout' class='none-info'>--i</i>";
	noneEstRevenueInfo = "<i data-tooltip='Monthly revenue cannot be estimated for this product because it either does not have a monthly sales estimate or a buy box price' class='none-info'>--i</i>";
	salesFromAPIInfo = "<i data-tooltip='Jungle Scout uses rank to calculate estimated sales/revenue. The best sellers rank for the parent category is not shown on this product&#39;s listing page, only through Amazon&#39;s API. Historically, in this particular scenario, ranks seem to fluctuate greatly and therefore the estimated sales/revenue should be used with caution. We recommend tracking this product in our Product Tracker to get more accurate monthly sales' class='none-info'>i</i>";
	notActiveFilterInput = "This data column is not currently selected, enable it using the settings wheel in the top right of this menu";
	notActiveTrendBtn = "The keyword trends only apply to search terms, to view, return to an Amazon search results page";
	activeTrendBtn = "Google Trend Report";
	priceChartInfo = "View Product Price History";
	rankChartInfo = "View Product Sales Rank History";
	sameRankVariationInfo = "<i data-tooltip='When Amazon assigns all variations the same rank, individual sales cannot be calculated.  Total sales for the listing are displayed on the top line' class='none-info'>--v</i>";

	//Templates, Popups and resources
	var mainJsPopupPath = chrome.extension.getURL("jsPopup.html");
	var sharePopupPath = chrome.extension.getURL("share-popup.html");
	var defaultDrawerPath = chrome.extension.getURL("drawer/default.html");

	//Images resources
	imagesPath = chrome.extension.getURL("images");
	var jsProLogoTopBar = imagesPath + "/js-logo-top-menu.png";
	var closeJsPopupImg = imagesPath + "/icons/white-cross.png";
	var refreshJsPopupImg = imagesPath + "/icons/refresh-active.png";
	var refreshJsPopupDeImg = imagesPath + "/icons/loading-deactive.png";
	var drawerMenuImg = imagesPath + "/icons/menu-active.png";
	var drawerDeactiveMenuImg = imagesPath + "/icons/menu-deactive.png";
	var cloudWordsImg = imagesPath + "/icons/word-cloud-active.png";
	var trendImg = imagesPath + "/icons/trend-button.png";
	var shareImg = imagesPath + "/icons/share-button.png";
	var removeRowImg = imagesPath + "/icons/cross-active.png";
	var noProductsSearchResultsImg = imagesPath + "/amazon-search-result-page.jpg";
	var noProductListingImg = imagesPath + "/amazon-product-listing-page.jpg";
	var welcomeJsPro = imagesPath + "/welcome-js-pro.png";
	var noChartImg = imagesPath + "/js-searching.png";

	//jQuery objects
	var jsContainer = $("<section class='jsContainer' style='display: none'></section>");

	//Globals
	tabUrl = window.location.href;
	dailyToken = null;
	var ajaxRequestsFinishedTimeout = null;
	var getProductsData = new GetProductsData();
	var state = null;
	var showProductImageTimeout = null;
	var wishListInfProductsObserver = null;
	var wishListLsProductsObserver = null;
	var storeFrontProductsObserver = null;

	//Current website details
	currentProtocol = location.protocol;
	currentBaseUrl = currentProtocol + "//"+location.hostname;
	currentTld = location.hostname.split('.').reverse()[0] ? location.hostname.split('.').reverse()[0] : "com";
	fullCurrentTld = currentTld == "uk" ? "co.uk" : currentTld == "mx" ? "com.mx" : currentTld;
	currentCurrency = "$";
	
	bestSellerRankText = "Best Sellers Rank";
	bestSellerRankTextDe = "Amazon Bestseller-Rang";
	bestSellerRankTextFr = "Classement des meilleures ventes d'Amazon";
	bestSellerRankTextMx = "Clasificación en los más vendidos de Amazon";
	bestSellerRankTextEs = "Clasificación en los más vendidos de Amazon";
	bestSellerRankTextIt = "Posizione nella classifica Bestseller di Amazon";

	//NA
	if(currentTld == "mx"){
		bestSellerRankText = bestSellerRankTextMx;
	}
	//EU
	else if(currentTld == "uk"){
		currentCurrency = "£";
	}else if(currentTld == "de"){
		currentCurrency = "€";
		bestSellerRankText = bestSellerRankTextDe;
	}else if(currentTld == "fr"){
		currentCurrency = "€";
		bestSellerRankText = bestSellerRankTextFr;
	}else if(currentTld == "es"){
		currentCurrency = "€";
		bestSellerRankText = bestSellerRankTextEs;
	}else if(currentTld == "it"){
		currentCurrency = "€";
		bestSellerRankText = bestSellerRankTextIt;
	}
	//IN
	else if(currentTld == "in"){
		currentCurrency = "₹";
	}

	//Tooltip effect
	var toolTipSelector = ".jsToolTip";
	var toolTipClass = "jsToolTip";
	var hasToTopToolTip = false;
	var hasJsTpMinWidth = false;
	var hastoLeftToolTip = false;
	var theToolTipHeight = 0;
	var theToolTipWidth = 0;
	let cssObj = {};
	$("body").on("mouseenter mouseleave mousemove", "section.jsContainer [data-tooltip]", function(e){
		if(e.type == "mouseenter"){
			//Change the position of the tooltip to the top
			$(this).hasClass("toTopToolTip") ? (hasToTopToolTip = true, toolTipClass += " toTopToolTip", toolTipSelector += ".toTopToolTip") : null;
			//Check the min width of the tooltip
			$(this).hasClass("jsTpMinWidth") ? (hasJsTpMinWidth = true, cssObj["min-width"] = "330px" ) : null;
			//Change the position of the tooltip to the right
			$(this).hasClass("toLeftToolTip") ? (hastoLeftToolTip = true, toolTipClass += " toLeftToolTip", toolTipSelector += ".toLeftToolTip") : null;
			// Hover over code
		    let theToolTipText = $(this).attr('data-tooltip');
		    if(theToolTipText.length > 0){
		    	let $theToolTipObj = $("<p class='"+toolTipClass+"'></p>")
			    .html(theToolTipText)
			    .appendTo('body')
			    .css(cssObj)
			    .fadeIn('slow');
			    theToolTipHeight = $theToolTipObj.height();
			    theToolTipWidth = $theToolTipObj.width();
		    }
		} else if(e.type == "mousemove"){
			//Default values
			cssObj['top'] = e.pageY + 30;
			cssObj['left'] = e.pageX - 10
			//Check the position of the tooltip
			hasToTopToolTip ? (cssObj['top'] = e.pageY - theToolTipHeight - 35, cssObj['left'] = e.pageX - 10) : null;
	        hastoLeftToolTip ? (cssObj['top'] = e.pageY + 30, cssObj['left'] = e.pageX - theToolTipWidth) : null;
	        hasToTopToolTip && hastoLeftToolTip ? (cssObj['top'] = e.pageY - theToolTipHeight - 35, cssObj['left'] = e.pageX - theToolTipWidth) : null;
	        $(toolTipSelector).css(cssObj);
		} else if(e.type == "mouseleave"){
			$(toolTipSelector).remove();
			toolTipSelector = ".jsToolTip";
			toolTipClass = "jsToolTip";
			hasToTopToolTip = false;
			hasJsTpMinWidth = false;
			hastoLeftToolTip = false;
			theToolTipHeight = 0;
			cssObj = {};
		}
	});

	//If the category has changed and got from the API
	$("body").on("myCategoryChanged", function(e, theRowCount, theCategory){
		if(theCategory == "N.A."){
			$("#js-table tr#"+theRowCount+" td.js-category").html(noneCategoryInfo);
		} else{
			$("#js-table tr#"+theRowCount+" td.js-category").text(theCategory);
			$("#js-table tr#"+theRowCount+" td.js-category").attr("title", theCategory);
			//Change the attributes
			$("#js-table tr#"+theRowCount).attr("data-category", theCategory);
		}
	});

	//If the rank has changed and got from the API
	$("body").on("myRankChanged", function(e, theRowCount, theRank){
		if(theRank == "N.A."){
			$("#js-table tr#"+theRowCount+" td.js-rank").html(noneRankInto);
		} else{
			$("#js-table tr#"+theRowCount+" td.js-rank").html("<a href='#' data-chart='rank' class='toTopToolTip' data-tooltip='"+rankChartInfo+"' class='toTopToolTip' data-tooltip='"+rankChartInfo+"' title='"+theRank+"'>"+theRank+"</a>");
			$("body").trigger("ajaxRequestsFinished");
			//Change the attributes
			$("#js-table tr#"+theRowCount).attr("data-rank",pureNumber(theRank));
		}
	});

	//--------------------------------------------------------------------------------//
	//Inject popup
	$("body").prepend(jsContainer);
	jsContainer.load(mainJsPopupPath,function(){
		$("#jsProLogoTopBar").attr("src", jsProLogoTopBar);
		$("#closeJsPopup img").attr("src", closeJsPopupImg);
		$("#refreshJsPopup img").attr("src", refreshJsPopupImg);
		$("#drawerMenu img").attr("src", drawerMenuImg);
		$("#wordsCloudPopup img").attr("src", cloudWordsImg);
		$("#trendPopup img").attr("src", trendImg);
		$("#sharePopup img").attr("src", shareImg);
		$(".main-screen .js-no-products .js-search-results-page-img").attr("src", noProductsSearchResultsImg);
		$(".main-screen .js-no-products .js-listing-page-img").attr("src", noProductListingImg);
		$(".js-product-history-no-chart img").attr("src", noChartImg);
		
		//Scroll
		$('section.jsContainer .content-table, section.jsContainer .js-words-cloud-popup .js-words-cloud-content, section.jsContainer .js-add-children-message .js-track-children-products-table').enscroll({
	    	verticalScrolling: true,
	        verticalTrackClass: 'track4',
	        verticalHandleClass: 'handle4',
	        showOnHover: false,
	        propagateWheelEvent: false
	    });

	    //Loading share popup
		$("section.jsContainer .js-share-popup").load(sharePopupPath);
		
		//Set the water mark
        wmark.init({
            "position": "center",
            "path": imagesPath + "/screenshot-logo.png"
        });

		//Load the menu
		$(".js-drawer-menu .js-drawer-wrapper").load(defaultDrawerPath, function(){
			$(".js-default-drawer-footer img").attr("src", welcomeJsPro);
		});
	});
	
	//--------------------------------------------------------------------------------//
	//Waiting messages from browser action
	chrome.runtime.onConnect.addListener(function(port) {
 		if(port.name == "jsPopupChannel"){
			port.onMessage.addListener(function(response) {
				if(response.url == window.location.href){
					//Check auth object
					chrome.storage.local.get("auth",function(result){ 
						if(typeof result.auth != "undefined"){
					 		if (response.action == "openCloseJsPopup"){
								if($(".jsContainer").is(":visible")){
									$(".jsContainer #closeJsPopup").get(0).click();
								}else{
									//Get the daily token
									dailyToken = JSON.parse(result.auth).daily_token;

									//Get the current URL
									tabUrl = window.location.href;

									state = new currentState(tabUrl);
									checkCurrentState(tabUrl);
									$(".jsContainer").fadeIn("fast");

									//Send google analytics
							        chrome.runtime.sendMessage({
							            action: "googleAnalyticsAction",
							            page: "jsPopup.js"
							        });

							        //Send the metric request
									$.ajax({
										url: 'https://junglescoutpro.herokuapp.com/api/v1/make_extension_metric',
										type: "POST",
										crossDomain: true,
										data: {
											dailyToken: dailyToken,
											username: JSON.parse(result.auth).username,
											event: 'Extension Activity',
											eventData: {'Feature':'JSL'}
										}
									});
								}
							}//End if openCloseJsPopup
					 	}
					});
				}
			});	
		}
	});

	//--------------------------------------------------------------------------------//
	//Close jsPopup button
	$("body").on("click",".jsContainer #closeJsPopup",function(e){
		e.preventDefault();
		//Close other popup
		hidePopups();
		//Close JS popup
		$(".jsContainer").fadeOut("fast");
		//Remove content table to save Amazon pages!
		$("#js-table tbody").html("");
	    chrome.runtime.sendMessage({ action: "stopAllAjaxRequests" });
	    //Stop the operservers
		if(wishListInfProductsObserver){
			wishListInfProductsObserver.disconnect();
		}

		if(wishListLsProductsObserver){
			wishListLsProductsObserver.disconnect();
		}

		if(storeFrontProductsObserver){
			storeFrontProductsObserver.disconnect();
		}
	});

	//--------------------------------------------------------------------------------//
	//Refresh jsPopup button
	$("body").on("click",".jsContainer #refreshJsPopup",function(e){
		e.preventDefault();
		//Close other popup
		hidePopups();
		//Remove all requests
		chrome.runtime.sendMessage({ action: "stopAllAjaxRequests" });
		//Start clear the current state
		chrome.storage.local.remove("current_state");
		tabUrl = window.location.href;
		state = new currentState(tabUrl);
		checkCurrentState(tabUrl);
		//Stop the operservers
		if(wishListInfProductsObserver){
			wishListInfProductsObserver.disconnect();
		}
		if(wishListLsProductsObserver){
			wishListLsProductsObserver.disconnect();
		}
		if(storeFrontProductsObserver){
			storeFrontProductsObserver.disconnect();
		}
	});

	//--------------------------------------------------------------------------------//
	//After the ajax requests have been stopped, to refresh headers
	$("body").on("ajaxRequestsFinished", function(event, data){
		clearTimeout(ajaxRequestsFinishedTimeout);
		ajaxRequestsFinishedTimeout = setTimeout(function(){
			var currentRowsNumber = $("#js-table tbody tr").length;
			if(state && currentRowsNumber > 0){
				//In products page and children products
				var currentChildrenProducts = $("#js-table .child-product").length;
				//On has children, active est. sales or est. revenue
				var firstVariationRank = $("#js-table tbody tr:first").attr("data-rank");
				if(currentChildrenProducts >= 1 && firstVariationRank != "N.A."){
					var isAllRankMatch = true;
					//Check rank match compared to the main product
					$("#js-table .child-product").each(function(index,row){
						var currentRank = $(this).attr("data-rank");
						if(currentRank != firstVariationRank){
							isAllRankMatch = false;
							return false;
						}
					});

					//All variations have the same rank and change the current est. sales and revenue
					if(isAllRankMatch){
						$("#js-table .child-product .js-est-sales").html(sameRankVariationInfo);
						$("#js-table .child-product .js-est-revenue").html(sameRankVariationInfo);
					}else{
						$("#js-table .child-product").each(function(index, row){
							var currentEstSales = $(this).attr("data-estSales");
							var currentEstRevenue = $(this).attr("data-estRevenue");

							if(currentEstSales != "< 5" && isNaN(currentEstSales)){
								$(this).find("td.js-est-sales").html(noneEstSalesInfo);
							} else {
								let $tempObject = $(this).find("td.js-est-sales");
								$tempObject.hasClass("gray-cell") ? $tempObject.html(numberWithCommas(currentEstSales)+" "+salesFromAPIInfo) : $tempObject.text(numberWithCommas(currentEstSales));
							}

							if(currentEstRevenue != "< 5" && currentEstRevenue == "N.A."){
								$(this).find("td.js-est-revenue").html(noneEstRevenueInfo);
							} else {
								let $tempObject = $(this).find("td.js-est-revenue");
								$tempObject.hasClass("gray-cell") ? $tempObject.html(currentEstRevenue+" "+salesFromAPIInfo) : $tempObject.text(currentEstRevenue);
							}
						});
					}
				}//end if there are children
				else if(currentChildrenProducts >= 1){
					$("#js-table tbody tr .js-est-sales").html(noneEstSalesInfo);
					$("#js-table tbody tr .js-est-revenue").html(noneEstRevenueInfo);
				}//End if there are children but the parent has N.A.

				//Get all avg boxes
				renderHeaderBoxes();
				reInitializeTableSorter(true);
				state.saveCurrentState();

				//Stop the spinners
				$("#refreshJsPopup img").removeClass("js-processing-btn");
				$("#extractResults").html("Extract Next Page &#x2023;");
			}
		}, 3000);
	});

	//--------------------------------------------------------------------------------//
	//Save the current status
	$("body").on("saveJSCurrentState", function(event, data){
		if(state){
			state.saveCurrentState();
		}
	});

	//--------------------------------------------------------------------------------//
	//Add X button besides results
	var currentTdNumber = null;
	$("body").on("mouseenter mouseleave","#js-table tbody tr",function(ev){
		if($("#js-table tbody tr").length >=2 ){
			let $tdNumber = $(this).find("td.js-number");
			if(ev.type === 'mouseenter'){
				$(this).css("background-color", "#fff4e5");
				currentTdNumber = $(this).hasClass("child-product") ? " " : $tdNumber.text();
				currentTdNumber = currentTdNumber ? currentTdNumber : $(this).attr("id") == "0" ? "1" : $(this).attr("id");
				$tdNumber.html("<img id='removeCurrentRow' src='"+removeRowImg+"' />");
			}else{
				$(this).css("background-color", "white");
				$tdNumber.text(currentTdNumber);
				currentTdNumber = null;
			}
		}
	});

	//On X button is clicked to remove current row
	$("body").on("click","#removeCurrentRow",function(e){ 
		e.preventDefault();
		$(this).parents("tr").remove();
		renderHeaderBoxes();
		if(state){
			reInitializeTableSorter(true);
			state.saveCurrentState();
		}
	});

	//--------------------------------------------------------------------------------//
	//On table rows changed (removed, added), update the counter
	$("body").on("onTableRowChanged",function(e, justVisible){ 
	    if(!$(".jsContainer .center-footer").is(":visible")){
        	$(".jsContainer .center-footer").css("display", "inline-block");
        }
		//Show the table rows count
		let theRowsCount = justVisible ? $("#js-table tbody tr:visible").length : $("#js-table tbody tr").length
        if(theRowsCount){
            $(".jsContainer .center-footer span").text("1 - "+ theRowsCount);
        } else {
        	$(".jsContainer .center-footer span").text("-");
        }
	});

	//--------------------------------------------------------------------------------//
    //Image Preview for products
    $("body").on("mouseenter mouseleave","section.jsContainer .product-image-cell",function(ev){ 
        var theProductRow = $(this).parents("tr");
        var theProductImage = theProductRow.attr("data-image");
        if(ev.type === 'mouseenter'){
            showProductImageTimeout = setTimeout(function(){
        	    if(typeof theProductImage != "undefined" && ( theProductImage.indexOf("http") == 0 || theProductImage.indexOf("data:image") == 0) ){
	            	productImageObject = new Image();
					productImageObject.src = theProductImage;
					productImageObject.addEventListener('load', productImageListener, true);
				}
				var $productImageContainer = $("section.jsContainer .product-hover-container");
				$productImageContainer.fadeIn("fast");
				//Position the popup to center
				centerThePopups($productImageContainer);
			},500);
       		
       		//Load product data to the card
       		$(".product-hover-container .product-hover-name").text($(this).parents("tr").attr("data-title"));
       		//Price
       		let theCurrentPrice = theProductRow.attr("data-price");
       		if(theCurrentPrice != "N.A."){
       			theCurrentPrice = theCurrentPrice.split(".");
       			$(".product-hover-container .product-hover-price").css("display", "block");
       			$(".product-hover-container .product-hover-price span.js-first-price-num").text(currentCurrency + theCurrentPrice[0]).css("display", "inline-block");
       			$(".product-hover-container .product-hover-price span.js-second-price-num").text("." + theCurrentPrice[1]).css("display", "inline-block");
       		} else{
       			$(".product-hover-price span.js-first-price-num, .product-hover-price span.js-second-price-num").css("display", "none");
       		}

   		    //Check if the product is prime
   			if(theProductRow.attr("data-prime") == "true"){
   				$(".product-hover-price .js-product-prime").css("display", "inline-block");
   			} else {
   				$(".product-hover-price .js-product-prime").css("display", "none");
   			}

       		//Rating
       		let theCurrentRating = theProductRow.attr("data-rating");
       		let theCurrentReview = theProductRow.attr("data-reviews");
       		theCurrentReview = theCurrentReview != "N.A." ? theCurrentReview : theCurrentRating;
       		if(typeof theCurrentRating != "undefined" && theCurrentRating != "N.A."){
       			$(".product-hover-container .product-hover-rating").css("display", "block");
       			$(".product-hover-container .product-hover-rating span:last").text(theCurrentReview);
       			theCurrentRating = theCurrentRating.split(".");
       			$(".product-rating-stars span:lt("+theCurrentRating[0]+")").addClass("full-star");
       			if(typeof theCurrentRating[1] != "undefined"){
       				$(".product-rating-stars span.full-star:last").next().addClass("half-star");
       			}
       		} else{
       			$(".product-hover-container .product-hover-rating").css("display", "none");
       		}
        }else if(ev.type === 'mouseleave'){
        	$(".product-rating-stars span").removeClass("full-star half-star");
        	if(showProductImageTimeout){
        		clearTimeout(showProductImageTimeout);
        		$(".product-hover-container .product-hover-img").attr("src","").css("display", "none");
        		$("section.jsContainer .product-hover-container").fadeOut("fast");
        		if(typeof productImageObject != "undefined" && productImageObject){
	        		productImageObject.removeEventListener('load', productImageListener, true);
	    			productImageObject = null;
    			}
        	}
        }
    });

    //Hide product image viewer anyway when the mouse leaves JS
    $("body").on("mouseleave","section.jsContainer .content-table",function(ev){  
    	$(".product-hover-container .product-hover-img").attr("src","").css("display", "none");
    	if(typeof productImageObject != "undefined" && productImageObject){
    		productImageObject.removeEventListener('load', productImageListener, true);
			productImageObject = null;
		}
    });

    //Center the image popup
    function productImageListener(){
	    let width = productImageObject.width;
	    let height = productImageObject.height;
	    let $productHoverContainer = $("section.jsContainer .product-hover-container");
	    $("section.jsContainer .product-hover-img").attr("src",productImageObject.src).css("display", "block");
	    //Position the popup to center
	    centerThePopups($productHoverContainer);
	}

	//--------------------------------------------------------------------------------//
    //Show price/rank history
    $("body").on("click",".js-price a, .js-rank a",function(e){
    	e.preventDefault();
    	var $productHistoryPopup = $(".js-product-history-popup");
    	//Hide other popups
        hidePopups();
        //The chart data
        var $theParentRow = $(this).parents("tr");
        var theAsin = $theParentRow.attr("data-asin");
        var theProductName = $theParentRow.attr("data-title");
        var theImg = $theParentRow.attr("data-image");
        theImg = typeof theImg != "undefined" && ( theImg.indexOf("http") == 0 || theImg.indexOf("data:image") == 0) ? theImg : null;
        var thePrice = $theParentRow.attr("data-price");
        var theCategory = $theParentRow.attr("data-category");
        var theType = $(this).attr("data-chart");
        var theStore = currentTld == "com" ? "us" : currentTld;
        var theHistoryTitle = theType == "price" ? "Marketplace Price" : "Amazon Sales Rank";
        var chartMode = "lines";
        var tickPrefix = theType == "price" ? currentCurrency : "";
        var theLineShape = theType == "price" ? "hv" : "lines";
        var theMakers = {};
        var xAxisTickFormat =  null;
        var yAxisTickFormat = null;

		//Fill simple product details
        $productHistoryPopup.find("h2").text(theHistoryTitle);
        $productHistoryPopup.find(".js-product-history-name").text(theProductName);
        if(theImg){
        	$productHistoryPopup.find(".js-product-history-img").attr("src", theImg).fadeIn();
        } else {
        	$productHistoryPopup.find(".js-product-history-img").attr("src", theImg).css("display", "none");
        }

        //Make the request
        $.ajax({
			url: "https://junglescoutpro.herokuapp.com/api/v1/product_history?type="+theType+"&asin="+theAsin+"&store="+theStore+"&category="+encodeURIComponent(theCategory)+"&dailyToken="+dailyToken+"&price="+thePrice,
			type: "GET",
			crossDomain: true,
			success: function(responseJSON){ 
				let canShowChart = responseJSON.status && typeof responseJSON.data != "undefined" && responseJSON.data[0].clean().length >= 2 && responseJSON.data[1].clean().length >= 2 ? true : false;
				if(!canShowChart){
					$(".js-product-history-chart").css("display", "none");
					$(".js-product-history-no-chart").css("display", "block");
					centerThePopups($productHistoryPopup);
					return false;
				} else{
					$(".js-product-history-chart").css("display", "block");
					$(".js-product-history-no-chart").css("display", "none");
				}

				//Start draw the chart
				Plotly.newPlot($(".js-product-history-chart").get(0) , [
				{
				    x: responseJSON.data[0],
				    y: responseJSON.data[1],
				    mode: chartMode,
				    marker: theMakers,
				    textposition: 'bottom',
				    hoverlabel: {
					    bgcolor: "rgba(81, 102, 112, 0.9)",
					    bordercolor: "rgba(81, 102, 112, 0.9)",
					    font: {
					    	family: "WorkSansSemiBold",
					    	size: 12,
					    	color: "#ffffff"
					    }
					},
					hoverinfo:"x+y",
				    line: {
				    	shape: theLineShape,
				    	color: '#ff9100'
				    },
				    type: 'scatter'
				}],
				{
					xaxis: {
						color: "#516670",
						tickformat: xAxisTickFormat
					},
					yaxis: {
						color: "#516670",
						tickprefix: tickPrefix,
						tickformat: yAxisTickFormat
					},
					hovermode:"closest",
					title: false,
					margin: {
					    l: 50,
					    r: 10,
					    b: 35,
					    t: 20
					}
				},
				{
					displayModeBar: false
				});
			}, 
			error : function(){
				$("section.jsContainer .js-product-history-chart").css("display", "none");
				$("section.jsContainer .js-product-history-no-chart").css("display", "block");
				centerThePopups($productHistoryPopup);
				return false;
			}
		});
		centerThePopups($productHistoryPopup);
		$("section.jsContainer .container").addClass("invisible-container");
		$("section.jsContainer .js-product-history-popup").fadeIn();
    });

    //Handle events of zoom/unzoom of plotly
    $("body").on("plotly_relayout","section.jsContainer .js-product-history-chart",function(event, data){
    	if(Object.keys(data).length == 4) {
    		//Zoomed
    		$(".js-product-history-popup .js-chart-zoom-message").fadeIn();
    	} else if(Object.keys(data).length == 2 && typeof data["xaxis.autorange"] != "undefined" && typeof data["yaxis.autorange"]){
    		//Auto resize
    		$(".js-product-history-popup .js-chart-zoom-message").css("display", "none");
    	}
    });

    //--------------------------------------------------------------------------------//
    //Hide product history price/rank/sales
    $("body").on("click","section.jsContainer #closeProductHistory",function(){
    	$("section.jsContainer .js-product-history-popup").fadeOut("fast",function(){
    		$(".js-product-history-no-chart").css("display", "none");
			$(".js-product-history-chart").css("display", "block");
			$(".js-product-history-popup .js-product-history-img").attr("src", "");
    		Plotly.purge($(".js-product-history-chart").get(0));
    		$(".js-product-history-popup .js-chart-zoom-message").css("display", "none");
    	});
    	$("section.jsContainer .container").removeClass("invisible-container");
    });

	//--------------------------------------------------------------------------------//
    //Show Google trend chart
    $("body").on("click","section.jsContainer #trendPopup",function(e){ 
    	e.preventDefault();
    	if($(this).hasClass("js-inactive-btn-footer")){
    		return;
    	}
    	var googleTrendUrl = currentProtocol + "//trends.google.com/trends/explore?q="+$("#js-table").attr("data-searchTerm");
    	window.open(googleTrendUrl, '_blank');
    });

    //--------------------------------------------------------------------------------//
    //Extract results 
	$("body").on("click","section.jsContainer #extractResults",function(e){
		e.preventDefault();
		if($(this).hasClass("js-inactive-btn-footer")){
    		return;
    	}
    	
    	//Spinning
    	$("#refreshJsPopup img").addClass("js-processing-btn");
    	$(this).html("Extract Next Page <img src='"+refreshJsPopupDeImg+"' class='js-processing-btn' width='15px' height='15px' />");
    	//Start the process
		var currentExtractURL = $("#js-table").attr("data-extractUrl");
		if($('#js-table tr').length > 1){
			if($(this).attr("data-section") == "SearchPage"){
				getProductsData.searchResultsData(currentExtractURL);
			}
			else if($(this).attr("data-section") == "MostPopular"){
				getProductsData.mostPopularData(currentExtractURL);
			}
			else if($(this).attr("data-section") == "SellerPage"){
				getSellerProductOtherPage(function(result){
					getProductsData.sellerPageData(result);
				});
			}
			else if($(this).attr("data-section") == "BuyingGuidePage"){
				showOppScoreBox = false;
				getBuyingGuideProductOtherPage(function(result){
					getProductsData.buyingGuidePageData(result);
				});
			}
		}
	});

	//--------------------------------------------------------------------------------//
    //Add the product to the js web app
    $("body").on("click",".js-more .js-add-to-tracker",function(e){
    	e.preventDefault();
    	//Hide other popups
        hidePopups();
        var productASIN = $(this).parents("tr").attr("data-asin");
    	chrome.storage.local.get("auth",function(result){
    		if(typeof result.auth != "undefined"){ 
    			result = JSON.parse(result.auth);
    			var theCountry = currentTld;
    			theCountry = theCountry == "com" ? "us" : theCountry;
    			$.ajax({
    				url: "https://junglescoutpro.herokuapp.com/api/v1/add_to_tracker",
			        type: "POST",
			        crossDomain: true,
			        data: {username:result.username, asin:productASIN, country:theCountry},
			        dataType: "json",
			        success:function(result){ 
			        	if(result != null && typeof result.status != "undefined"){
			        		//Product added to the tracker
			        		if(result.status && result.code == 0){
			        			showPopUpMessage("Success!", "<p>Your product has been added to the Web Tracker!</p> <p>View your products <a href='https://members.junglescout.com/#/tracker' target='_blank'>here.</a></p>");
				        	} 
				        	//Product has been added before
				        	else if (result.status && result.code == 1){
				        		showPopUpMessage("Whoops!", "<p>This product has already been added to the Web Tracker. Try adding another!</p> <p>View your products <a href='https://members.junglescout.com/#/tracker' target='_blank'>here.</a></p>");
				        	}
				        	//Custom message (don't add the parent product)
				        	else if (result.status && result.code == 2){
				        		showAddParentProdcutPopUpMessage(result.data);
				        	}
				        	//Something went wrong?!
				        	else {
				        		showPopUpMessage("Whoops!", result.message);
				        	}
				        }
			        },
			        error:function(xhr,status,error){ 
			        	showPopUpMessage("Whoops!", error);
			        }
    			});
    		}
    	});
    });

	//--------------------------------------------------------------------------------//
    //Showing the default drawer menu
    $("body").on("click","section.jsContainer #drawerMenu, .profile-drawer .closeDrawerMenu",function(e){
    	e.preventDefault();
    	hidePopups();
    	let $theDrawerMenu = $(".js-drawer-menu");
    	if($theDrawerMenu.css("left") == "-327px"){ //Show the drawer
    		$("section.jsContainer").css("overflow", "hidden");
    		$theDrawerMenu.css("display","block");
    		$("#drawerMenu img").attr("src", drawerDeactiveMenuImg);
    		//Change the height of it
    		$theDrawerMenu.height($("section.jsContainer").height() - $("section.jsContainer .top-menu-bar").outerHeight());
    		//Send google analytics to filter JS as it's the default one
	        chrome.runtime.sendMessage({
	            action: "googleAnalyticsAction",
	            page: "filter.js"
	        });
    		//Always refresh the drawer
    		refreshDefaultDrawer();
    		//Show the drawer
			$("section.jsContainer .container").addClass("invisible-container");
    		$theDrawerMenu.clearQueue().animate({left: 0}, 500, function(){
    			$("section.jsContainer").css("overflow", "visible");
    		});
    	} else if($theDrawerMenu.css("left") == "0px"){ //Hide the drawer
    		$("#drawerMenu img").attr("src", drawerMenuImg);
    		$("section.jsContainer").css("overflow", "hidden");
    		$theDrawerMenu.clearQueue().animate({left: -327}, 500, function(){
    			$theDrawerMenu.css("display", "none");
    			$("section.jsContainer").css("overflow", "visible");
    			$("section.jsContainer .container").removeClass("invisible-container");
    		});
    	}
    });

    //--------------------------------------------------------------------------------//
    //Hide the floating message popup
    $("body").on("click","section.jsContainer #closeFloatMessage",function(e){ 
    	$("section.jsContainer .js-floating-message").fadeOut("slow");
    	$("section.jsContainer #js-table").css("opacity","1");
    	$("section.jsContainer .container").removeClass("invisible-container");
    	//Clear the previous content
    	$(".js-floating-message .js-message-content").empty();
    	$(".js-floating-message h2").removeClass("js-remove-margin");
    });

    //--------------------------------------------------------------------------------//
    //Hide all popups and the drawer menu if the user clicked on the invisible container
    $("body").on("click","section.jsContainer .container.invisible-container",function(e){ 
    	hidePopups();
    	//Hide the drawer menu
    	if($(".js-drawer-menu").css("left") == "0px"){
    		$("section.jsContainer #drawerMenu").click();
    	}
    });

	//--------------------------------------------------------------------------------//
	//Check previous state from local storage
	function checkCurrentState(tabUrl){
		chrome.storage.local.get(["current_state"],function(result){ 
			result = typeof result != "undefined" && Object.keys(result).length > 0 ? JSON.parse(result.current_state) : null;
			if( result && tabUrl == result.currentUrl){
				$("section.jsContainer #js-table").html(result.currentTable).attr("data-firstRow", result.currentFirstRow);
	            $("section.jsContainer #js-table").fadeIn('fast', function(){
					reInitializeTableSorter(true);
	            });

	            $(".summary-result.js-avg-sales").html(stripScriptTags(result.currentAvgSales)).attr("title", stripScriptTags(result.currentAvgSales));
	            $(".summary-result.js-avg-sales-rank").html(stripScriptTags(result.currentAvgSalesRank)).attr("title", stripScriptTags(result.currentAvgSalesRank));
	            $(".summary-result.js-avg-price").html(stripScriptTags(result.currentAvgPrice)).attr("title", stripScriptTags(result.currentAvgPrice));
	            $(".summary-result.js-avg-reviews").html(stripScriptTags(result.currentAvgReviwes)).attr("title", stripScriptTags(result.currentAvgReviwes));

	            //Extract next page button
	            if(typeof result.currentExtractUrl != "undefined" && result.currentExtractUrl && typeof result.currentExtractElement != "undefined"){
	                $("section.jsContainer #extractResults").attr("data-section",result.currentExtractElement).removeClass("js-inactive-btn-footer");
	                $("section.jsContainer #js-table").attr("data-extracturl",result.currentExtractUrl);
	            }else{
	                $("section.jsContainer #extractResults").addClass("js-inactive-btn-footer");
	            }

	            //View trend button
	            if(typeof result.currentSearchTerm != "undefined" && result.currentSearchTerm){
	                $("section.jsContainer #js-table").attr("data-searchTerm",result.currentSearchTerm);
	                $("section.jsContainer #trendPopup").removeClass("js-inactive-btn-footer").attr("data-tooltip", activeTrendBtn);
	            }else{
	                $("section.jsContainer #trendPopup").addClass("js-inactive-btn-footer").attr("data-tooltip", notActiveTrendBtn);
	            }

	            //Show the table rows count
	            $("body").trigger("onTableRowChanged");

	            //Run the observers again if any was stopped
				if(wishListInfProductsObserver){
					wishListInfProductsObserver.observe($(".inf-list-container #awl-inf-grid-items").get(0), {childList: true});
				}

				if(wishListLsProductsObserver){
					wishListLsProductsObserver.observe($("#item-page-wrapper #g-items").get(0), {childList: true});
				}

				if(storeFrontProductsObserver){
					storeFrontProductsObserver.observe($(".stores-container").get(0), {childList: true});
				}
			}else{
				//Clean previous data
	            cleanJsPopup();

	            //Scraping these kind of most popular sections:
	            //Best sellers, New Releases, Mover and Shaker, Top Rated, Most Wished, Gifts
	            if(mostPopularRegex.test(tabUrl)){
	            	$("#refreshJsPopup img").addClass("js-processing-btn");
	                getProductsData.mostPopularData(tabUrl);
	            }
	            //One product page
	            else if(asinRegex.test(tabUrl) && !wishListInfRegex.test(tabUrl) && !wishListLsRegex.test(tabUrl) && !storeFrontRegex.test(tabUrl) && !shopPages.test(tabUrl)){
	            	$("#refreshJsPopup img").addClass("js-processing-btn");
	                getProductsData.productPageData();
	            }
	            //Seller Page
	            else if ($(URLParamatersToArray(tabUrl)).filter(["seller", "marketplaceID"]).length == 2 || getParameter("seller",tabUrl)){
	              	$("#refreshJsPopup img").addClass("js-processing-btn");
	                getProductsData.sellerPageData(getSellerProductFirstPage());
	            }
	            //Buying Guide
	            else if (buyingGuideRegex.test(tabUrl)){
	            	showOppScoreBox = false;
	            	$("#refreshJsPopup img").addClass("js-processing-btn");
	                getProductsData.buyingGuidePageData(getBuyingGuideProductFirstPage());
	            }
	            //new storeFront pages
	            else if(storeFrontRegex.test(tabUrl)){
	            	showOppScoreBox = false;
	            	$("#refreshJsPopup img").addClass("js-processing-btn");
	            	getProductsData.storefrontData();
	            }
	            //Search page
	            else if(generalSearchRegex.test(tabUrl) || shopPages.test(tabUrl) || $(URLParamatersToArray(tabUrl)).filter(["url","field-keywords","keywords","field-brandtextbin","rh", "rnid", "node", "merchant", "marketplaceID"]).length > 0 || getParameter("merchant",tabUrl) || getParameter("me",tabUrl)){
	               	$("#refreshJsPopup img").addClass("js-processing-btn");
	                getProductsData.searchResultsData(tabUrl);
	            }
	            //Wishlist inf pages
	            else if(wishListInfRegex.test(tabUrl)){
	            	$("#refreshJsPopup img").addClass("js-processing-btn");
	            	getProductsData.wishListInfData();
	            }
	            //Wishlist Ls pages
	            else if(wishListLsRegex.test(tabUrl)){
	            	$("#refreshJsPopup img").addClass("js-processing-btn");
	            	getProductsData.wishListLsData();
	            }
	            else{
	                showNoProductsScreen();
	            }
			}
		});
	}
	//--------------------------------------------------------------------------------//
	// Scrapping Module
	function GetProductsData(){
		var searchResultsData = function(searchUrl){
			if(searchUrl){
			 	var pageNumber = getParameter("page",searchUrl) ? getParameter("page",searchUrl) : 1;
			 	var currentExtractURL = updateParameter(searchUrl,"page",parseInt(pageNumber)+1);
			 	$("#js-table").attr("data-extractUrl",currentExtractURL);
			 	$("#extractResults").attr("data-section","SearchPage");
				
				if(searchUrl == window.location.href){
					searchResultsInternalData($("body"));
				}else{
					chrome.runtime.sendMessage({
				        action: "makeRequest",
				        link: searchUrl
				    }, function(response){
					    //Some times it respond with undefined
				    	if(typeof response == "undefined" || typeof response.data == "undefined"){
				    		searchResultsData(searchUrl);
				    	} else{
				    		searchResultsInternalData(response.data);
				    	}
				    });
				}
			}
		}
		
		//-----------------------------------------------------//
		var searchResultsInternalData = function(data){
	        products = $(data, "body").find(".s-result-list li[data-asin], #mainResults .prod.celwidget");
	        var productsLength = products.length;
			
			//First Row
			var searchedText = $(data, "body").find("#twotabsearchtextbox[name='field-keywords']").val() || getParameter("field-keywords", window.location.href) || $(data, "body").find("#s-result-info-bar-content .a-text-bold").text();
			searchedText = searchedText ? escapeHTML(searchedText) : "";
			$("#js-table").attr({"data-firstRow": (searchedText ? "Search Term: "+searchedText : ""), "data-searchTerm": searchedText});

			if(productsLength <= 0){
        		showNoProductsScreen();
				return;
        	}

        	//Extract results
        	var resultsRow = $(data, "body").find("#pagn");
   			var pagination = new Pagination(resultsRow);
        	var pagesNumber = pagination.getAllResultsNumber();
        	var pageNumber = pagination.getCurrentPage();
        	if(parseInt(pageNumber) > parseInt(pagesNumber) ){
        		//Don't show extract next page
        		$("#js-table").attr("data-extractUrl","");
        	}
        	showProductsScreen();
        	//Loop on all products
        	var productsCounter = 0;
	        $.each(products, function(index, val) {
	        	if($(val).find(".multiImageTopCategories, .acs-carousel-header").length || $(val).find(":header").text().match(/(sponsored)|(sponsorisé)|(gesponsert)/i) || $(val).find("h2").text().match(/amazon(.*?)page/i)){
	        		return true;
	        	}
	        	//Used for ordered table
    			var currentCounter = productsCounter + ($("#js-table tbody tr").length) + 1;
    			var theAsin = $(val).attr("data-asin");

    			//Get the price "exception case"
		       	var price;
          		price = $(val).find("span.a-color-price.a-text-bold:first").text();
          		price = price.match(priceRegex) ? price.match(priceRegex)[0] : null;
          		if(price){
          			price = price.replace(currencyRegex,""); //Take it just a number
		        	price = price.replace(thousandSeparatorRegex,"$1"); //remove any thousand separator
			        price = price.replace(",","."); //Because of Germany and French stores
          		} else{
          			price = "N.A.";
          		}
	        	
          		//Check if it's prime or not
          		var isPrime = $(val).find("i.a-icon-prime").length > 0 ? true : false;
	        	
	        	//Get the brand "exception case"
	        	var brand = $(val).find(".a-row.a-spacing-none:has(.a-color-secondary:nth-of-type(2)):first").text();
	        	brand = brand ? brand.match(brandRegex) : null; 
	        	brand = brand ? brand[0] : null; 

		        //Internal requests 
		        var link = $(val).find(".s-access-detail-page, h3 a").attr("href");
		        if(link && link.indexOf("http") == -1 && link.indexOf("https") == -1){
		        	theAsin = getASINFromURL(link);
				    link = currentBaseUrl+link;
		        }

		        if(link){
		        	link = link.trim();
		       		getInternalProduct(link,{theAsin:theAsin, price:price, currentCounter:currentCounter, brand:brand, isPrime:isPrime});
		        }
	       	
	       		//Increase products counter +1
	       		++productsCounter;
	       	});
		}
		
		//-----------------------------------------------------//
		var mostPopularData = function(searchUrl){
			if(searchUrl){
				//Because pagination happened in the user side, I need to replace it with page number
				if(searchUrl.match(/#[0-9]+/)){
					var currectPage = searchUrl.match(/#[0-9]+/)[0];
					currectPage = currectPage.replace(/\#/,"");
					searchUrl = searchUrl.replace(/#[0-9]+/,"");
					searchUrl = updateParameter(searchUrl,"pg",parseInt(currectPage));
				}

				$("#extractResults").attr("data-section","MostPopular");
				$("#js-table").attr("data-searchTerm","");

				//First Row
			 	if(searchUrl.match(newReleasesRegx)){
			 		$("#js-table").attr("data-firstRow","Amazon Hot New Releases");
				}else if(searchUrl.match(moversAndShakersRegx)){
					$("#js-table").attr("data-firstRow","Amazon Movers and Shakers");
				}else if(searchUrl.match(topRatedRegx)){
					$("#js-table").attr("data-firstRow","Amazon Top Rated");
				}else if(searchUrl.match(mostWishesRegx)){
					$("#js-table").attr("data-firstRow","Amazon Most Wished For");
				}else if(searchUrl.match(mostGiftedRegx)){
					$("#js-table").attr("data-firstRow","Amazon Gift Ideas");
				}else{
					$("#js-table").attr("data-firstRow","Amazon Best Sellers");
				}
	        
				if(searchUrl == window.location.href){
					mostPopularInternalData($("body"));
				}else{
					chrome.runtime.sendMessage({
				        action: "makeRequest",
				        link: searchUrl
				    }, function(response){
					    //Some times it respond with undefined
				    	if(typeof response == "undefined" || typeof response.data == "undefined"){
				    		mostPopularData(searchUrl);
				    	} else {
				    		mostPopularInternalData(response.data);
				    	}
				    });
				}
			}
		}
		
		//-----------------------------------------------------//
		var mostPopularInternalData = function(data){
			products = $(data, "body").find("#zg_left_col1 .zg_itemImmersion, #zg_left_col1 .zg_item, #zg-ordered-list li");
			if(products.length <= 0){
        		showNoProductsScreen();
				return;
        	}

        	//Extract results
        	var isPagination = $(data, "body").find("ul.a-pagination, ol.zg_pagination");
        	if(isPagination.get(0)){
        		var nextResult = $(data, "body").find("ul.a-pagination li.a-selected, ol.zg_pagination li.zg_selected").next().text();
        		if(nextResult){
        			var currentExtractURL = $(data, "body").find("li.a-selected, li.zg_selected").next().find("a").attr("href");
        			$("#js-table").attr("data-extractUrl",currentExtractURL);
        			showProductsScreen();
        		}else{
        			$("#js-table").attr("data-extractUrl","");
        			showProductsScreen();
        		}
        	}else{
        		$("#js-table").attr("data-extractUrl","");
        		showProductsScreen();
        	}

	        $.each(products, function(index, val) {
	        	//Used for ordered table
    			var currentCounter = index + ($("#js-table tbody tr").length) + 1;
				//Check if it's prime or not
          		var isPrime = $(val).find("i.a-icon-prime").length > 0 ? true : false;
		        //Internal requests 
		        var link = $(val).find(".zg_title a, .zg_rankInfo a:first-child, .zg_itemWrapper a:first-child, .zg-item a:first-child").attr("href");
		        if(link && link.indexOf("http") == -1 && link.indexOf("https") == -1){
		        	link = currentBaseUrl+link;
		        }

		        if(link){
		        	link = link.trim();
		       		getInternalProduct(link,{currentCounter:currentCounter, isPrime:isPrime});
		        }
	       });
		}
		
		//-----------------------------------------------------//
		var productPageData = function(){
			showProductsScreen();
			//Get current product
			getInternalProduct(window.location.href, {theAsin:getASINFromURL(window.location.href), currentProductPage:""}, function(){
				//Get other products
				products = $("body").find("#fallbacksession-sims-feature li, #session-sims-feature li, #purchase-sims-feature li, #purchaseShvl li.shoveler-cell, #variation_color_name li, #variation_style_name li, #variation_size_name li, #variation_flavor_name li, #variation_scent_name li, #variation_item_package_quantity li, #purchase-similarities_feature_div li, #day0-sims-feature li, #shelfSwatchSection-color_name .twisterShelf_swatch, #desktop-dp-sims_purchase-similarities-sims-feature li, #desktop-dp-sims_hardlines-day0-sims-feature li");
				//Don't show extract next page
				$("#js-table").attr({"data-extractUrl":"", "data-searchTerm":""});
				//Loop on all products
		        $.each(products, function(index, val) {
		        	//Used for ordered table
	    			var currentCounter = index + $("#js-table tbody tr").length;
			        //Check if it's prime or not
	  				var isPrime = $(val).find("i.a-icon-prime").length > 0 ? true : false;
			        //Internal requests for products
			        var link = $(val).find("a:first").attr("href") || $(val).attr("data-dp-url");
			        var theAsin = null;
			        if(link && link.indexOf("http") == -1 && link.indexOf("https") == -1){
			        	theAsin = getASINFromURL(link);
			        	link = currentBaseUrl+"/dp/"+theAsin;
			        }

			        if(link){
			        	link = link.trim();
			        	if(typeof $(val).attr("id") != "undefined" && 
			        		( $(val).attr("id").indexOf("color_name") == 0 || $(val).attr("id").indexOf("style_name") == 0 
			        			|| $(val).attr("id").indexOf("size_name") == 0 || $(val).attr("id").indexOf("flavor_name") == 0 
			        			|| $(val).attr("id").indexOf("scent_name") == 0 || $(val).attr("id").indexOf("item_package_quantity") == 0)){
				        	getInternalProduct(link,{currentCounter:currentCounter, child:true, theAsin: theAsin, isPrime:isPrime});
				        }else{
				        	getInternalProduct(link,{currentCounter:currentCounter, theAsin:theAsin, isPrime:isPrime});
				        }
			        }
		        });
			});
		}
		
		//-----------------------------------------------------//
		var sellerPageData = function(result){
        	products = result.products;
        	$("#js-table").attr("data-searchTerm","");
        	if(products.length <= 0 && result.action=="sellerProductFirstPage"){
		    	showNoProductsScreen();
		    	return;
		    }else if(products.length <= 0 && result.action=="sellerProductOtherPage"){
		    	$("section.jsContainer #extractResults").css("display","none");
		    	return;
		    }

        	var sellerName = result.name ? result.name : "N.A.";
        	//First Row
		    $("section.jsContainer #js-table").attr("data-firstRow","Seller: "+escapeHTML(sellerName));
        	$("section.jsContainer #extractResults").attr("data-section","SellerPage");
        
			var currentPage = parseInt(result.currentPage);
			var pages = parseInt(result.pages);

			if(!isNaN(currentPage) && !isNaN(pages)){
				var nextPage = (currentPage+1);
				if(nextPage <= pages){
					$("#js-table").attr("data-extractUrl","true"); //Because it happenes in user side
					showProductsScreen();
				}else{
					$("#js-table").attr("data-extractUrl",""); //Because it happenes in user side
					showProductsScreen();
				}
			}else{
				$("#js-table").attr("data-extractUrl",""); //Because it happenes in user side
				showProductsScreen();
			}
			
        	$.each(products, function(index, val) {
	        	//Used for ordered table
	        	var currentCounter = index + ($("#js-table tbody tr").length) + 1;
	        	var price = "N.A.";
          		price = $(val).find(".product-price").text();
          		price = price.match(priceRegex) ? price.match(priceRegex)[0] : "N.A.";
	        	price = price.replace(currencyRegex,""); //Take it just a number
	        	price = price.replace(thousandSeparatorRegex,"$1"); //remove any thousand separator
		        price = price.replace(",","."); //Because of Germany and French stores
		        
		        //Check if it's prime or not
          		var isPrime = $(val).find("i.a-icon-prime").length > 0 ? true : false;

		        //Internal requests 
		        var link = $(val).find(".product-title a").attr("href") || $(val).find(".AAG_ProductTitle a").attr("href");
		        if(link && link.indexOf("http") == -1 && link.indexOf("https") == -1){
		        	link = currentBaseUrl+link;
		        }

		        if(link){
		        	link = link.trim();
					getInternalProduct(link,{price:price, currentCounter:currentCounter, isPrime:isPrime});
		        }
        	});
		}
		
		//-----------------------------------------------------//
		var buyingGuidePageData = function(result){
        	products = $(result.products);
        	var productsLength = products.length; 
        	if(productsLength <= 0 && result.action=="buyingGuideProductFirstPage"){
		    	showNoProductsScreen();
		    	return;
		    }else if(productsLength <= 0 && result.action=="buyingGuideProductOtherPage"){
		    	showProductsScreen(false);
		    	return;
		    }
        	var buyingGuideName = result.name ? result.name : "N.A.";
        	//First Row
		    $("#js-table").attr({"data-firstRow":escapeHTML(buyingGuideName), "data-searchTerm":""});
        	$("#extractResults").attr("data-section", "BuyingGuidePage");
        	
        	//Extract results (just check if the button is there) 	
        	if(result.resultsRow){
        		$("#js-table").attr("data-extractUrl","true"); //Because it happenes in user side
        	}else{
        		$("#js-table").attr("data-extractUrl",""); //Because it happenes in user side
        	}
        	showProductsScreen();
        	$.each(products, function(index, val) {
	        	//Used for ordered table
    			var currentCounter = index + ($("section.jsContainer #js-table tbody tr").length) + 1;
				//Internal requests 
		        var link = $(val).find(".buying-guide-search-card-content > a").attr("href");
		        //Check if it's prime or not
          		var isPrime = $(val).find("i.a-icon-prime").length > 0 ? true : false;
 				if(link && link.indexOf("http") == -1 && link.indexOf("https") == -1){
		        	link = currentBaseUrl+link;
		        }

		        if(link){
		        	link = link.trim();
		       		getInternalProduct(link,{currentCounter:currentCounter, isPrime:isPrime});
				}
	       	});
		}
		
		//-----------------------------------------------------//
		var wishListInfData = function(listedProducts){
			if(typeof listedProducts != "undefined" && listedProducts.length > 0){
				products = listedProducts;
			} else{
				products = $("body").find(".inf-asin-container");
			}

			var productsLength = products.length; 
			if(productsLength <= 0){
        		showNoProductsScreen();
				return;
        	}

			//Don't show extract next page
			$("section.jsContainer #js-table").attr({"data-extractUrl":"", "data-searchTerm":"", "data-firstRow":"Influencers"});
			showProductsScreen();

			//Loop on products
	        $.each(products, function(index, val) {
	        	//Used for ordered table 
    			var currentCounter = index + ($("#js-table tbody tr").length) + 1;
		        //Internal requests for products
		        var link = $(val).find("a[href]:first").attr("href") || $(val).find("a.inf-asin-link").attr("href");
		        var theAsin = null;
		        //Check if it's prime or not
          		var isPrime = $(val).find("i.a-icon-prime").length > 0 ? true : false;
		        if(link && link.indexOf("http") == -1 && link.indexOf("https") == -1){
		        	theAsin = getASINFromURL(link);
		        	link = currentBaseUrl+"/dp/"+theAsin;
		        }

		        if(link){
		        	link = link.trim();
			        getInternalProduct(link, {currentCounter:currentCounter, theAsin:theAsin, isPrime:isPrime});
		        }
	        });

	        //Start observering new children
	        if(wishListInfProductsObserver == null){
			    wishListInfProductsObserver = new MutationObserver(function(mutations) {
					mutations.forEach(function(mutation) {
						if(typeof mutation.addedNodes != "undefined" && mutation.addedNodes.length > 0){
							let allNodes = mutation.addedNodes;
							for(let x=0; x < allNodes.length; x++){
								if($(allNodes[x]).hasClass("awl-inf-grid-row")){
									wishListInfData($(allNodes[x]).find(".inf-asin-container"));
								}
							}
						}
					});    
				});
				wishListInfProductsObserver.observe($(".inf-list-container #awl-inf-grid-items").get(0), {childList: true});
			}
		}
		
		//-----------------------------------------------------//
		var wishListLsData = function(listedProducts){
			if(typeof listedProducts != "undefined" && listedProducts.length > 0){
				products = listedProducts;
			} else{
				products = $("body").find("#item-page-wrapper #g-items li[data-id]");
			}

			var productsLength = products.length; 
			if(productsLength <= 0){
        		showNoProductsScreen();
				return;
        	}
	
			//Don't show extract next page
			$("#js-table").attr({"data-extractUrl":"", "data-searchTerm":"", "data-firstRow":"Wish List"});
			showProductsScreen();

			//Loop on products
	        $.each(products, function(index, val) {
	        	//Used for ordered table 
    			var currentCounter = index + ($("#js-table tbody tr").length) + 1;

		        //Internal requests for products
		        var link = $(val).find("a[href]:first").attr("href");
		        var theAsin = null;
		        //Check if it's prime or not
          		var isPrime = $(val).find("i.a-icon-prime").length > 0 ? true : false;

		        if(link && link.indexOf("http") == -1 && link.indexOf("https") == -1){
		        	theAsin = getASINFromURL(link);
		        	link = currentBaseUrl+"/dp/"+theAsin;
		        }

		        if(link){
		        	link = link.trim();
			        getInternalProduct(link, {currentCounter:currentCounter, theAsin:theAsin, isPrime:isPrime});
		        }
	        });

	        //Start observering new children
	        if(wishListLsProductsObserver == null){
			    wishListLsProductsObserver = new MutationObserver(function(mutations) {
					mutations.forEach(function(mutation) {
						if(typeof mutation.addedNodes != "undefined" && mutation.addedNodes.length > 0){
							let allNodes = mutation.addedNodes;
							for(let x=0; x < allNodes.length; x++){
								if($(allNodes[x]).attr("data-id")){
									wishListLsData($(allNodes[x]));
								}
							}
						}
					});    
				});
				wishListLsProductsObserver.observe($("#item-page-wrapper #g-items").get(0), {childList: true});
			}
		}

		//-----------------------------------------------------//
		//To get the new storefron products page
		var storefrontData = function(listedProducts){
			if(typeof listedProducts != "undefined" && listedProducts.length > 0){
				products = listedProducts;
			} else{
				products = $("body").find(".stores-container .style__product__2RTVJ, .stores-container li");
			}

			var productsLength = products.length; 
			if(productsLength <= 0){
        		showNoProductsScreen();
				return;
        	}

        	//Don't show extract next page
        	var theStoreFront = $("meta[name='og:title']").attr('content');
        	theStoreFront = theStoreFront ? "Storefront of " + theStoreFront : "Storefront";
			$("#js-table").attr({"data-extractUrl":"", "data-searchTerm":"", "data-firstRow":theStoreFront});
			showProductsScreen();
			//Loop on products
	        $.each(products, function(index, val) {
	        	//Used for ordered table 
    			var currentCounter = index + ($("#js-table tbody tr").length) + 1;

		        //Internal requests for products
		        var link = $(val).find("a[href]:first").attr("href");
		        var theAsin = null;
		        //Check if it's prime or not
          		var isPrime = $(val).find("img.style__prime__1OOsc, img.style__badge__1ufoR").length > 0 ? true : false;

		        if(link && link.indexOf("http") == -1 && link.indexOf("https") == -1){
		        	theAsin = getASINFromURL(link);
		        	link = currentBaseUrl+"/dp/"+theAsin;
		        }

		        if(link){
		        	link = link.trim();
			        getInternalProduct(link, {currentCounter:currentCounter, theAsin:theAsin, isPrime:isPrime});
		        }
	        });

	        //Start observering new children
	        if(storeFrontProductsObserver == null){
			    storeFrontProductsObserver = new MutationObserver(function(mutations) {
					mutations.forEach(function(mutation) {
						if(typeof mutation.addedNodes != "undefined" && mutation.addedNodes.length > 0){
							let allNodes = mutation.addedNodes;
							for(let x=0; x < allNodes.length; x++){
								storefrontData($(allNodes[x]).find(".style__product__2RTVJ, li"));
							}
						}
					});    
				});
				storeFrontProductsObserver.observe($(".stores-container").get(0), {childList: true});
			}
		}
		
		//-----------------------------------------------------//
		var getInternalProduct = function(link, data, callback){
			clearTimeout(ajaxRequestsFinishedTimeout);
			var messageObj = null;
			if(typeof data.currentProductPage != "undefined"){
				//First Row
    			$("section.jsContainer #js-table").attr("data-firstRow", "Product Page: " + escapeHTML($("#productTitle").text()));
				messageObj = {action: "makeDataParse", htmlPage: $("body").html(), bestSellerRankText:bestSellerRankText, passingData: data};
			} else{
				messageObj = {action: "makeRequest", link: link, bestSellerRankText:bestSellerRankText, passingData: data};
			}

			chrome.runtime.sendMessage(messageObj, function(bgParser){
		    	//Some times it respond with undefined
		    	if(typeof bgParser == "undefined"){
		    		getInternalProduct(link, data);
		    		return true;
		    	}
		    	
		    	currentCounter = typeof data.currentCounter != "undefined" ? data.currentCounter : 0;
	          	asin = typeof data.theAsin != "undefined" && data.theAsin && data.theAsin.length != 0 ? data.theAsin : getASINFromURL(link);

	          	//Global to reach from parser
	          	productTitle = bgParser.getProductTitle;
	          	productImage = bgParser.getProductImage;
		        brand = bgParser.getBrand;

	          	//I need it all times
	          	price = bgParser.getPrice;
	          	finalPrice = price != "N.A." ? currentCurrency + parseFloat(price).toFixed(2) : "N.A.";
	          	
		        //I need it all times
		        category = bgParser.getRankAndCategory.category;
	          	bbSeller = bgParser.getBbSeller;

	          	//I need it all times
	          	rank = bgParser.getRankAndCategory.rank;
	          	finalRank = rank != "N.A." ? "#" + rank : rank;
	          	finalRank = numberWithCommas(finalRank);
	           
	            reviews = bgParser.getReviews;
	          	rating = bgParser.getRating;
	          	
          		//Call estimated sales
          		//To get reveune, needs est. sales
      			renderEstSalesOrRevenueOrCategoryOrRank(currentCounter, asin, category, rank, price, data);

	          	//Start render rows on tables
	          	renderRow(link, data);

	          	//resort table
	          	sortTable($("section.jsContainer #js-table").get(0));

	          	//Callback
	          	if(typeof callback != "undefined"){
	          		callback.call(this);
	          	}
	        });
		}
		
		//----------------------------- Private Methods -----------------------------------//
		//Get estimated sales
		var renderEstSalesOrRevenueOrCategoryOrRank = function(theCounter, theAsin, theCategory, theRank, thePrice, passingData){
			clearTimeout(ajaxRequestsFinishedTimeout);
			var store = currentTld == "com" ? "us" : currentTld;
			var requestURL = null;
			//To get just the estimated sales
			if(theCategory != "N.A." && theRank != "N.A."){
				requestURL = "https://junglescoutpro.herokuapp.com/api/v1/est_sales?store="+store+"&asin="+theAsin+"&rank="+theRank+"&category="+encodeURIComponent(theCategory)+"&dailyToken="+dailyToken;
			} 
			//To get the category/rank/estimated sales
			else{
				requestURL = "https://junglescoutpro.herokuapp.com/api/v1/est_sales?store="+store+"&asin="+theAsin+"&dailyToken="+dailyToken;
			}
			
			//Make request to get estimated sales results
			lastXMLRequest = $.ajax({
				url: requestURL,
				type: "GET",
				crossDomain: true,
				success: function(responseJson){ 
					var estSales = "N.A.";
					var isSalesFromAPI = false;
					if(responseJson && responseJson.status){
						estSales = responseJson.estSalesResult;

						//Get the category from the API
						if(theCategory == "N.A."){
							var respondCategory = typeof responseJson.category != "undefined" ? responseJson.category : "N.A.";
							$("body").trigger("myCategoryChanged", [theCounter, respondCategory]);
						}

						//Get the rank from the API
						if(theRank == "N.A."){
							var respondRank = typeof responseJson.rank != "undefined" ? responseJson.rank : "N.A.";
							respondRank = respondRank != "N.A." ? "#" + respondRank : respondRank;
		          			respondRank = numberWithCommas(respondRank);
		          			$("body").trigger("myRankChanged", [theCounter, respondRank]);
		          			if(respondRank != "N.A."){
		          				isSalesFromAPI = true;
		          			}
						}
					} else if(responseJson && !responseJson.status){
						console.error(responseJson);
					}

	        		var estRevenu = getEstimatedRevenue(estSales, thePrice);
	        		$("#js-table tr#"+theCounter).attr({"data-estRevenue":estRevenu, "data-estSales":estSales});
		        	//For a child product, don't add estimated sales or revenue
		        	if(typeof passingData == "undefined" || (typeof passingData != "undefined" && typeof passingData.child == "undefined") ){
		        		//Estimated sales render row
	        			if(estSales == "N.A."){
	        				$("#js-table tr#"+theCounter+" td.js-est-sales").html(noneEstSalesInfo);
	        			} else{
	        				if(isSalesFromAPI){
	        					$("#js-table tr#"+theCounter+" td.js-est-sales").html(numberWithCommas(estSales)+" "+salesFromAPIInfo);
	        				} else {
	        					$("#js-table tr#"+theCounter+" td.js-est-sales").text(numberWithCommas(estSales));
	        					isSalesFromAPI = false;
	        				}

	        				$("body").trigger("ajaxRequestsFinished");
	        			}

			        	//Estimated revenue render row
		        		if(estRevenu == "N.A."){
		        			$("#js-table tr#"+theCounter+" td.js-est-revenue").html(noneEstRevenueInfo);
		        		} else{
		        			if(isSalesFromAPI){
	        					$("#js-table tr#"+theCounter+" td.js-est-revenue").html(numberWithCommas(estRevenu)+" "+salesFromAPIInfo);
	        				} else {
	        					$("#js-table tr#"+theCounter+" td.js-est-revenue").text(numberWithCommas(estRevenu));
	        					isSalesFromAPI = false;
	        				}
		        		}
		        	}

		        	//Gray cell if the sales are from the API
		        	if(isSalesFromAPI){
		        		$("#js-table tr#"+theCounter+" td.js-est-revenue").addClass("gray-cell");
		        		$("#js-table tr#"+theCounter+" td.js-est-sales").addClass("gray-cell");
		        	}
				}, 
				error: function(xhr, status, error){
					console.error("Could not reach to the estimated sales! ASIN: "+theAsin + ". " + error);
					//If something went wrong with Rail app
					$("#js-table tr#"+theCounter+" td.js-est-sales").html(noneEstSalesInfo);
					$("#js-table tr#"+theCounter+" td.js-est-revenue").html(noneEstRevenueInfo);
				}
			});
		}
		
		//----------------------------------------------------//
		//Get estimated Revenue
		var getEstimatedRevenue = function (salesEq, thePrice){
			var finalEq = null;
			thePrice = thePrice.replace("," ,"");
			if(isNaN(thePrice) || salesEq == "N.A."){
				return "N.A.";
			}else if(salesEq == "< 5"){
				finalEq = "< " + currentCurrency + Math.round(thePrice * 5);
				return finalEq;
			}else if(!isNaN(salesEq)){
				finalEq = Math.round(salesEq * thePrice);
				finalEq = currentCurrency + numberWithCommas(finalEq);
				return finalEq;
			}else{
				return "N.A.";
			}
		}
		
		//----------------------------------------------------//
		//Start render the row
		var renderRow = function(link, passingData){
			var currentRowsNumber = $("#js-table tbody tr").length;
			var isPrime = typeof passingData.isPrime != "undefined" && passingData.isPrime ? true : false;

			//Global variables | 0 in current product page
			currentCounter = typeof currentCounter != "undefined" ? currentCounter : 0;
			
			//Child product
			if(typeof passingData != "undefined" && typeof passingData.child != "undefined"){
				//Show the parent indicator
				$("#js-table i.parent-product-indicator-icon").css("display", "inline-block");
				var currentRow = "<tr class='child-product' id='"+currentCounter+"'><td class='js-number'> </td>";
				currentRow += "<td class='js-more csv-hiddenable screenshot-hiddenable'><a href='#' class='js-add-to-tracker'><i class='add-to-tracker-icon toTopToolTip' data-tooltip='Add to your Product Tracker'></i></a></td>";
				currentRow += "<td class='js-product-name screenshot-hiddenable product-image-cell'><a href='"+link+"' target='_blank'>&nbsp;&nbsp;&nbsp;&nbsp;<i class='child-product-indicator'></i>&nbsp;"+productTitle+"</a></td>";
			}else{
				let addParentProductClass = currentCounter == 0 ? "class='parent-product'" : '';
				let addParentIndicator = currentCounter == 0 ? "<i class='parent-product-indicator-icon js-collapse'></i>&nbsp;" : '';
				var currentRow = "<tr "+addParentProductClass+" id='"+currentCounter+"'><td class='js-number'>"+(currentCounter == 0 ? "1" : currentRowsNumber)+"</td>";
				currentRow += "<td class='js-more csv-hiddenable screenshot-hiddenable'><a href='#' class='js-add-to-tracker'><i class='add-to-tracker-icon toTopToolTip' data-tooltip='Add to your Product Tracker'></i></a></td>";
				currentRow += "<td class='js-product-name screenshot-hiddenable product-image-cell'>"+addParentIndicator+"<a href='"+link+"' target='_blank'>"+productTitle+"</a></td>";
			}

			if(brand == "N.A."){
				currentRow += "<td class='js-brand screenshot-hiddenable'>"+noneBrandInfo+"</td>";
			} else{
				currentRow += "<td class='js-brand screenshot-hiddenable' title='"+escapeHTML(brand)+"'>"+brand+"</td>";
			}

			if(finalPrice == "N.A."){
				currentRow += "<td class='js-price'>"+nonePriceInfo+"</td>";
			} else {
				currentRow += "<td class='js-price'><a href='#' data-chart='price' data-tooltip='"+priceChartInfo+"' class='toTopToolTip' title='"+finalPrice+"'>"+finalPrice+"</a></td>";
			}

			if(category == "N.A."){
				currentRow += "<td class='js-category screenshot-hiddenable'>"+noneCategoryInfo+"</td>";
			} else {
				currentRow += "<td class='js-category screenshot-hiddenable' title='"+category+"'>"+category+"</td>";
			}

			if(finalRank == "N.A."){
				currentRow += "<td class='js-rank'>"+noneRankInto+"</td>";
			}else{
				currentRow += "<td class='js-rank'><a href='#' data-chart='rank' class='toTopToolTip' data-tooltip='"+rankChartInfo+"' title='"+finalRank+"'>"+finalRank+"</a></td>";
			}
			
			currentRow += "<td class='js-est-sales'>hmm...</td>";
			currentRow += "<td class='js-est-revenue'>hmm...</td>";

			if(reviews == "0"){
				currentRow += "<td class='js-reviews'>"+noneReviewsInfo+"</td>";
			} else {
				currentRow += "<td class='js-reviews' title='"+reviews+"'>"+reviews+"</td>";
			}

			if(rating == "N.A."){
				currentRow += "<td class='js-rating'>"+noneRatingInfo+"</td>";
			} else{
				currentRow += "<td class='js-rating' title='"+rating+"'>"+rating+"</td>";
			}

			if(bbSeller == "N.A."){
				currentRow += "<td class='js-bb-seller'>"+noneBBSellerInfo+"</td>";
			} else {
				currentRow += "<td class='js-bb-seller' title='"+bbSeller+"'>"+bbSeller+"</td>";
			}

			currentRow += "<td class='js-asin hidden hiddenable'>"+asin+"</td>";
			currentRow += "<td class='js-link hidden hiddenable'>"+currentBaseUrl+"/dp/"+asin+"</td>";
			currentRow += "</tr>";
			currentRow = $(currentRow);

			//Attributes
			currentRow.attr({
				"data-asin":asin,
				"data-rating":rating,
				"data-title":productTitle,
				"data-image":productImage,
				"data-price":pureNumber(finalPrice),
				"data-category":category,
				"data-reviews":reviews,
				"data-estSales":"N.A.",
				"data-estRevenue":"N.A.",
				"data-prime":isPrime,
				"data-rank":pureNumber(finalRank)
			});

			//Render the row
			currentRow.appendTo("#js-table tbody");
			$("body").trigger("onTableRowChanged");

			//If the operation has finished, fire!
          	$("body").trigger("ajaxRequestsFinished");
		}

		//----------------------------------------------------//
		return {
			getInternalProduct:getInternalProduct,
			searchResultsData: searchResultsData,
			mostPopularData: mostPopularData,
			productPageData: productPageData,
			sellerPageData: sellerPageData,
			wishListInfData: wishListInfData,
			wishListLsData: wishListLsData,
			storefrontData:storefrontData,
			buyingGuidePageData:buyingGuidePageData
		}
	}

	//--------------------------------------------------------------------------------//
	//Upload user profile image
	$("body").on("click",".js-drawer-menu .profile-drawer .profile-image",function(e){
		$(".profile-drawer input[name='profile-image-uploader']").get(0).click();
	});

	//Get the image data
	$("body").on("change",".js-drawer-menu .profile-drawer input[name='profile-image-uploader']",function(input){
		let theProfileImg = typeof input.target.files[0] != "undefined" && input.target.files[0] != null ? input.target.files[0] : null;
		var fileReader  = new FileReader();
		fileReader.addEventListener("load", function () {
			let theDataURLImg = fileReader.result.replace(/(\r\n|\n|\r)/gm, "");
		    $(".profile-image span").css("background-image", "url('" + theDataURLImg + "')");
		    //Save to the storage
		    localStorage("profileImg", theDataURLImg);
		}, false);

		if(theProfileImg){
			fileReader.readAsDataURL(theProfileImg);
		}
	});

	//--------------------------------------------------------------------------------//
	//View children products
	$("body").on("click","#js-table i.parent-product-indicator-icon",function(e){
		let $childrenProducts = $("#js-table tr.child-product");
		$(this).removeClass('js-collapsed js-collapse');
		//Show them
		if($("#js-table tr.child-product:visible").length == 0){
			$childrenProducts.slideDown();
			$(this).addClass('js-collapse');
		} 
		//Hide them
		else {
			$childrenProducts.slideUp();
			$(this).addClass('js-collapsed');
		}
	});

	//----------------------------------------------------------------------------------//
    //Report a problem link
    $("body").on("click",".js-drawer-menu .other-options-drawer #reportProblemBtn", function(e){ 
        e.preventDefault();
        var clientInfoObject = getClientInfo();
        var searchTerm = "";
        var amazonURL = "";
        var manifest = chrome.runtime.getManifest();
        var JSName = manifest.name;
        var JSVersion = manifest.version;
        chrome.storage.local.get(["current_state", "auth"], function(result){ 
            if(typeof result.current_state != "undefined"){
                var currentState = Object.keys(result).length > 0 ? JSON.parse(result.current_state) : null;
                if(currentState){
                    searchTerm = currentState.currentSearchTerm;
                    amazonURL = currentState.currentUrl;
                }
            }
            
            //Get the user email address
            let userEmailAddress = JSON.parse(result.auth);
           	userEmailAddress = typeof userEmailAddress.email != "undefined" && userEmailAddress.email.length != 0 ? userEmailAddress.email : "";

            var jsBug = JSON.stringify({clientInfoObject:clientInfoObject, searchTerm:searchTerm, amazonURL:amazonURL, JSName:JSName, JSVersion:JSVersion});
            goToUrl("https://www.junglescout.com/bugs-report/",{jsBug:jsBug, emailAddress: userEmailAddress},"POST");
        });
    });

    //----------------------------------------------------------------------------------//
    //Logout link
    $("body").on("click",".js-drawer-menu .other-options-drawer #logOutBtn", function(e){
        e.preventDefault();
        chrome.storage.local.remove(["auth", "last_screenshot", "current_state"]);
        //Send message to refresh Amazon pages
        chrome.runtime.sendMessage({
            action: "refreshAmazonPages"
        });
    });
});
