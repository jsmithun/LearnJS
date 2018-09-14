/**
 * @Author: Mohammad M. AlBanna
 * Copyright © 2018 Jungle Scout
 * 
 * show/hide/actions of the share popup
 */

$(function(){
	//If the file has injected many times
    if($(".jsContainer").length >= 1){
        return;
    }

    //Show share popup and its buttons
	$("body").on("click","section.jsContainer #sharePopup",function(e){
		e.preventDefault();
		if($(this).hasClass("js-inactive-btn-footer")){
    		return;
    	}
		//Hide other popups
		hidePopups();
		//Send google analytics
        chrome.runtime.sendMessage({
            action: "googleAnalyticsAction",
            page: "share-popup.html"
        });

	    //Position the popup to center
	    let $jsSharePopup = $(".js-share-popup");
		$jsSharePopup.css({
            "left": ($("section.container").width() - $jsSharePopup.width())/2, 
            "top": (($("section.container").height() - $jsSharePopup.height())/2)});
        
        //Invisible other stuff
        $("section.jsContainer .container").addClass("invisible-container");
		
		//View the popup
		$("section.jsContainer .js-share-popup").fadeIn();
	});

    //--------------------------------------------------------------------------------//
    //Facebook share buttons
    $("body").on("click",".js-share-popup .js-share-fb-btn",function(e){
        e.preventDefault();
        e.stopPropagation();
        if($('section.jsContainer #js-table tr').length > 1){ 
            var $jsWaterMarkImg = $("section.jsContainer .js-watermark");
            $jsWaterMarkImg.attr("src", "");
            $("section.jsContainer .content-table").scrollTop(0);
            $("section.jsContainer .content-table").scrollLeft(0);
            //Hide un-needed columns
            $("#js-table .screenshot-hiddenable").addClass('screenshot-hide');
            //Just show first 25 row
            $("#js-table tr:gt(26)").hide();
            //Hide all popups
            hidePopups();
            html2canvas($("section.jsContainer #js-table").get(0), {
                onrendered: function(canvas) {
                    var finalCanvasScreenContext = canvas.getContext("2d");
                    // - 10 is the scroll
                    var finalScreenshot = new Image();
                    finalScreenshot.src = canvas.toDataURL();
                    finalScreenshot.onload = function(){
                        canvas.width = finalScreenshot.width - 10;
                        canvas.height = finalScreenshot.height + 30; //+30 is the text
                        finalCanvasScreenContext.fillStyle = "#FAFAFA";
                        finalCanvasScreenContext.fillRect(0,0,finalScreenshot.width - 10,finalScreenshot.height + 30);
                        finalCanvasScreenContext.drawImage(finalScreenshot, 0, 0);

                        //Draw stroke
                        finalCanvasScreenContext.strokeStyle = "#CFCFCF";
                        finalCanvasScreenContext.lineWidth   = 1;
                        finalCanvasScreenContext.strokeRect(0,0, finalScreenshot.width - 10,finalScreenshot.height);
                        finalCanvasScreenContext.strokeRect(0,0, finalScreenshot.width - 10,finalScreenshot.height+30);

                        //Underneath text
                        finalCanvasScreenContext.fillStyle="#595959";
                        finalCanvasScreenContext.font="bold 13px sans-serif";
                        finalCanvasScreenContext.fillText("Data Collected with Jungle Scout. Ready to make Amazon product research easy? Find out more at www.JungleScout.com", (finalScreenshot.width-800)/2, finalScreenshot.height + 20);
                        $jsWaterMarkImg.attr("src", canvas.toDataURL());

                        //Apply the water mark
                        setTimeout(function(){
                            wmark.applyWatermark($jsWaterMarkImg.get(0), function(){
                                //Send to the API
                                $.ajax({
                                    url: "https://junglescoutpro.herokuapp.com/api/v1/image_upload",
                                    type: "POST",
                                    crossDomain: true,
                                    data: {image_data: $jsWaterMarkImg.attr("src")},
                                    beforeSend: function(){
                                        showPopUpMessage("One sec! Uploading now&nbsp;<img height='15px' src='"+imagesPath+"/icons/glass_emoji.png' />");
                                    },
                                    success: function(responseJSON){
                                        if(typeof responseJSON.status != "undefined" && responseJSON.status && typeof responseJSON.data != "undefined"){
                                            window.open("https://www.facebook.com/dialog/feed?app_id=414409295414333&ref=adcounter&link="+responseJSON.data+"&name=I found this private label product on www.junglescout.com . What do you think?&redirect_uri=https://www.facebook.com&actions=%5B%7B%22name%22%3A%22Get%20It%20Now%22%2C%22link%22%3A%22http%3A%2F%2Fwww.junglescout.com%22%7D%5D");
                                            $jsWaterMarkImg.attr("src", "");
                                            hidePopups();
                                        } else if(!responseJSON.status){
                                            showPopUpMessage("Whoops!", responseJSON.message);
                                            $jsWaterMarkImg.attr("src", "");
                                        }
                                    }, 
                                    error: function(jqXHR, textStatus, errorThrown){
                                        showPopUpMessage("Whoops!", textStatus);
                                        console.error(textStatus);
                                        $jsWaterMarkImg.attr("src", "");
                                    }
                                });
                            });
                        }, 30);
                    };

                    //Back un-needed columns
                    $("#js-table .screenshot-hiddenable").removeClass('screenshot-hide');
                    //Back all rows
                    $("#js-table tr:gt(26)").show();
                }
            });
        }
    });


	//--------------------------------------------------------------------------------//
	//Print Screen button
    $("body").on("click",".js-share-popup .js-download-screenshot-btn",function(e){ 
    	e.preventDefault();
    	e.stopPropagation();
    	if($('section.jsContainer #js-table tr').length > 1){
    		$("section.jsContainer .content-table").scrollTop(0);
    		$("section.jsContainer .content-table").scrollLeft(0);
	    	//Hide un-needed columns
	    	$("#js-table .screenshot-hiddenable").addClass('screenshot-hide');
	    	//Just show first 25 row
	    	$("#js-table tr:gt(26)").hide();
	    	//Hide all popups
	    	hidePopups();
	    	html2canvas($("section.jsContainer #js-table").get(0), {
				onrendered: function(canvas) {
					localStorage("last_screenshot",canvas.toDataURL(),function(){
						window.open(chrome.extension.getURL("screenshot.html"),'_blank');
						//Back un-needed columns
						$("#js-table .screenshot-hiddenable").removeClass('screenshot-hide');
						//Back all rows
						$("#js-table tr:gt(26)").show();
					});
				}
			});
	    }
    });

 	//--------------------------------------------------------------------------------//
    //Download to CSV
    $("body").on("click",".js-share-popup .js-download-csv-btn",function(e){
    	e.preventDefault();
    	e.stopPropagation();
    	if($('#js-table tr').length > 1){
    		$("#js-table .hiddenable").removeClass('hidden');

    		//The file name
    		var fileName = $('#js-table').attr("data-firstRow");
            if(fileName){
    			fileName = fileName.replace(":"," of");
    		} else{
    			fileName = "JS_Exported_CSV"
    		}
    		
    		var firstRow = $('#js-table').attr("data-firstRow");
    		if(firstRow){
    			firstRow = firstRow.replace(/\,/g,"");
    		}

    		//Print averages
			var avgSales = "Average Sales: "+ $(".summary-result.js-avg-sales").text();
    		var avgSalesRank = "Average Sales Rank: "+$(".summary-result.js-avg-sales-rank").text();
    		var avgPrice = "Average Price: "+$(".summary-result.js-avg-price").text();
    		var avgReviews = "Average Reviews: "+$(".summary-result.js-avg-reviews").text();

    		//Print date and time
    		var today = new Date();
			var day = today.getDate();
			var month = today.getMonth()+1;
			var year = today.getFullYear();
			var hours = today.getHours();
			var mins = today.getMinutes() < 10 ? "0"+today.getMinutes() : today.getMinutes();
			var exportDate = "Export date: "+month+"/"+day+"/"+year+" | Export time: "+hours+":"+mins;

		 	$('#js-table').table2CSV({fileName:fileName,firstRows:[exportDate,firstRow,avgSales,avgSalesRank,avgPrice,avgReviews]});
		 	$("#js-table .hiddenable").addClass('hidden');
    	}
	});

    //--------------------------------------------------------------------------------//
	//Hide share popup
    $("body").on("click","section.jsContainer #closeSharePopup",function(e){
    	e.stopPropagation();
    	$("section.jsContainer .container").removeClass("invisible-container");
    	$(".js-share-popup").fadeOut();
    });
});