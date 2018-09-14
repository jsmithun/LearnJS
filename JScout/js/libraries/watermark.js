/* 
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 * watermark.js - Create watermarked images with Canvas and JS
 *
 * Version: 1 (2011-04-04)
 * Copyright (c) 2011	Patrick Wied ( http://www.patrick-wied.at )
 * This code is licensed under the terms of the MIT LICENSE
 *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 * Updated by: Mohammad M. AlBanna
 */

//If the file has injected many times
if($(".jsContainer").length >= 1){
    throw new Error("Injected!");
}

(function(w){
	var wm = (function(w){
		var doc = w.document,
		gcanvas = {},
		gctx = {},
		imgQueue = [],
		className = "js-watermark",
		watermark = false,
		watermarkPosition = "bottom-right",
		watermarkPath = "watermark.png?"+(+(new Date())),
		opacity = (255/(100/50)), // 50%
		initCanvas = function(){
			gcanvas = doc.createElement("canvas");
			gcanvas.style.cssText = "display:none;";
			gctx = gcanvas.getContext("2d");
			doc.body.appendChild(gcanvas);
		},
		initWatermark = function(){
			watermark = new Image();
			watermark.crossOrigin = "Anonymous";
			watermark.src = "";
			watermark.src = watermarkPath;

			if(opacity != 255){
				if(!watermark.complete)
					watermark.onload = function(){	
						applyTransparency();
					}
				else
					applyTransparency();
			}
		},
		// function for applying transparency to the watermark
		applyTransparency = function(){
			var w = watermark.width || watermark.offsetWidth,
			h = watermark.height || watermark.offsetHeight;
			setCanvasSize(w, h);
			gctx.drawImage(watermark, 0, 0);
			var image = gctx.getImageData(0, 0, w, h);
			var imageData = image.data,
			length = imageData.length;
			for(var i=3; i < length; i+=4){  
				imageData[i] = (imageData[i]<opacity)?imageData[i]:opacity;
			}
			image.data = imageData;
			gctx.putImageData(image, 0, 0);
			watermark.onload = null;
			watermark.src = "";
			watermark.src = gcanvas.toDataURL();
			// assign img attributes to the transparent watermark
			// because browsers recalculation doesn't work as fast as needed
			watermark.width = w;
			watermark.height = h;
		},
		configure = function(config){
			if(config["watermark"])
				watermark = config["watermark"];
			if(config["path"])
				watermarkPath = config["path"];
			if(config["position"])
				watermarkPosition = config["position"];
			if(config["opacity"])
				opacity = (255/(100/config["opacity"]));
			if(config["className"])
				className = config["className"];
			
			initCanvas();
			initWatermark();
		}
		setCanvasSize = function(w, h){
			gcanvas.width = w;
			gcanvas.height = h;
		},
		applyWatermark = function(img, callback){
			gcanvas.width = img.width || img.offsetWidth;
			gcanvas.height = img.height || img.offsetHeight;
			gctx.drawImage(img, 0, 0);
			var position = watermarkPosition,
			x = 0,
			y = 0;

			if(position.indexOf("center") != -1){
				x = (img.width - watermark.width)/2;
				y = (img.height - watermark.height)/2;
			}

			else if(position.indexOf("top")!=-1 || position.indexOf("left")!=-1){
				if(position.indexOf("top")!=-1)
					y = 10;
				else
					y = gcanvas.height-watermark.height-10;
				
				if(position.indexOf("left")!=-1)
					x = 10;
				else
					x = gcanvas.width-watermark.width-10;
			}

			gctx.drawImage(watermark, x, y);
			img.src = gcanvas.toDataURL();

			//If I need to do something after the watermark has been added
			if(typeof callback != "undefined"){
				callback.call(this);
			}
		}
		return {
			init: function(config){
				configure(config);
			},
			applyWatermark:applyWatermark
		};
	})(w);
	w.wmark = wm;
})(window);