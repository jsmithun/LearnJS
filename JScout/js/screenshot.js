/**
 * @Author: Mohammad M. AlBanna
 * Copyright © 2018 Jungle Scout
 * 
 * show/save the last screenshot
 */

$(function(){
	//If the file has injected many times
	if($(".jsContainer").length >= 1){
		return;
	}

	//----------------------------------------------------------------------------//
	//Get current saved screenshot
	chrome.storage.local.get(["last_screenshot"],function(result){ 
		if(typeof result.last_screenshot != "undefined"){
			var finalCanvasScreen = document.createElement("canvas");
			var finalCanvasScreenContext = finalCanvasScreen.getContext("2d");
				
			//Set the water mark
		    wmark.init({
				"position": "center",
				"path": "../images/screenshot-logo.png"
			});
				
			//Drow screenshot
			var finalScreenshot = new Image();
			finalScreenshot.src = result.last_screenshot;
			finalScreenshot.onload = function(){
				// - 10 is the scroll
				finalCanvasScreen.width = finalScreenshot.width - 10;
				finalCanvasScreen.height = finalScreenshot.height + 30; //+30 is the text
				finalCanvasScreenContext.fillStyle = "#FAFAFA";
				finalCanvasScreenContext.fillRect(0,0,finalScreenshot.width - 10,finalScreenshot.height + 30);
				finalCanvasScreenContext.drawImage(finalScreenshot, 0, 0);

				//Drow stroke
				finalCanvasScreenContext.strokeStyle = "#CFCFCF";
			    finalCanvasScreenContext.lineWidth   = 1;
			    finalCanvasScreenContext.strokeRect(0,0, finalScreenshot.width - 10,finalScreenshot.height);
			    finalCanvasScreenContext.strokeRect(0,0, finalScreenshot.width - 10,finalScreenshot.height+30);

			    //Underneath text
				finalCanvasScreenContext.fillStyle="#595959";
				finalCanvasScreenContext.font="bold 13px sans-serif";
				finalCanvasScreenContext.fillText("Data Collected with Jungle Scout. Ready to make Amazon product research easy? Find out more at www.JungleScout.com", (finalScreenshot.width-800)/2, finalScreenshot.height + 20);
				
				//Set the image
				$(".screenshot-image img").attr("src", finalCanvasScreen.toDataURL());
				//Apply the water mark
				setTimeout(function(){
					wmark.applyWatermark($(".js-watermark").get(0));
				}, 30);

			}//If image loaded
		}else{
			window.close();
		}
	});
	//----------------------------------------------------------------------------//
	//Download btn event
	$("body").on("click","#submit",function(e){
		var downloadedImage = $(".screenshot-image img").attr("src");
		if(downloadedImage){
			var downloadedImage = downloadedImage.replace("image/png","image/octet-stream");
			$(this).attr("download", "JungleScout-screenshot.png");
			$(this).attr("href",downloadedImage);
		} else {
			window.close();
		}
	});
});
 