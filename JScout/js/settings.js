/**
 * @Author: Mohammad M. AlBanna
 * Copyright © 2018 Jungle Scout
 *
 * Contains Jungle Scout Settings
 */

$(function() { 
	//---------------------------------------------------------------------------------//
	//Google Analytics
	var _gaq = _gaq || [];
	_gaq.push(['_setAccount', 'UA-52913301-9']);
	_gaq.push(['_trackPageview','settings.js']);

	(function() {
	  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	  ga.src = 'https://ssl.google-analytics.com/ga.js';
	  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
	})();
	//---------------------------------------------------------------------------------//
	$("body").on("change","input[type='checkbox']",function(e){
		$("#submit").removeClass("gray-btn");
	});

	$("body").on("change","input[type='checkbox']:not('.dont-touch')",function(e){
		$("input[type='checkbox']:enabled.dont-touch").prop("checked",false);
	});

	$("body").on("click","#selectAllSettings",function(e){
		$("#unSelectAllSettings").prop("checked",false);
		$("input[type='checkbox']:enabled").not(".dont-touch").prop("checked",true);
	});

	$("body").on("click","#unSelectAllSettings",function(e){
		$("#selectAllSettings").prop("checked",false);
		$("input[type='checkbox']:enabled").not(".dont-touch").prop("checked",false);
	});
	//---------------------------------------------------------------------------------//
	$("body").on("click","#submit",function(e){ 
		//Check the selected settings
		btnInProcess();

		if($("input[name='clearCache']").is(":checked")){
			chrome.storage.local.remove(["current_state"]);
		}

		if($("input[name='clearLastScreenshot']").is(":checked")){
			chrome.storage.local.remove("last_screenshot");
		}

		if($("input[name='clearLoginCredential']").is(":checked")){
			chrome.storage.local.remove(["auth", "last_screenshot", "current_state"]);
		}

		$("input[type='checkbox']").prop("checked",false);
		//Send message to refresh Amazon pages
        chrome.runtime.sendMessage({
            action: "refreshAmazonPages"
        });
        //Button status
        successState();
	});
	//---------------------------------------------------------------------------------//
	function successState(){
		var $theBtn = $("#submit span"); 
		$theBtn.fadeOut(500, function(){
			$(this).html("<img src='../images/icons/complete-active.png' />").fadeIn(500, function(){
				$("#submit").fadeOut(500, function(){
					$("#submit").html($("#submit").attr("data-content")).addClass("gray-btn").fadeIn(500);
				});
			});
		}); 
	}
	//---------------------------------------------------------------------------------//
	function btnInProcess(){
		$("#submit").attr("data-content", $("#submit").html());
		$("#submit span").html("<img src='../images/icons/loading-active.png' width='15px' height='15px' class='js-processing-btn'/>");
	}
});
