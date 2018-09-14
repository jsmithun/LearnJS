/**
 * @Author: Mohammad M. AlBanna
 * Copyright © 2018 Jungle Scout
 * 
 * check username and password
 */

//review-junglescout.herokuapp.com
//junglescoutpro.herokuapp.com


$(function(){
	//---------------------------------------------------------------------------------//
	//Google Analytics
	var _gaq = _gaq || [];
	_gaq.push(['_setAccount', 'UA-52913301-9']);
	_gaq.push(['_trackPageview','login.js']);

	(function() {
	  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	  ga.src = 'https://ssl.google-analytics.com/ga.js';
	  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
	})();
	//---------------------------------------------------------------------------------//
	$("body").on("click","#submit", function(e){
		e.preventDefault();
		clearState();
		btnInProcess();
		$(".message").text("Checking...");
		$(".message").css("visibility", "visible");

		var username = $("#username").val();
		var password = $("#password").val();
		username = username ? username.trim() : null;
		password = password ? password.trim() : null;

		if(!username || !password){
			errorState();
			$(".message").text("*Please check your username and password!");
			return false;
		}

		//Contact to API
		$.ajax({
	        url: "https://junglescoutpro.herokuapp.com/api/v1/users/initial_authentication",
	        type: "POST",
	        crossDomain: true,
	        data: {username:username, password:password, app:"jsl"},
	        dataType: "json",
	        success:function(result){
	            if(result && result.status){
					$(".message").text(result.message);
					var obj = {};
				    var key = "auth";
				    obj[key] += "auth";
				    var dailyToken = typeof result.daily_token == "undefined" ? "" : $.trim(result.daily_token);
				    obj[key] = JSON.stringify({username:result.username, email:result.email, nickname:result.nickname, daily_token:dailyToken, last_checked:Date.now()});
				    chrome.storage.local.set(obj);
				    successState();
				    //Send message to refresh Amazon pages
			        chrome.runtime.sendMessage({
			            action: "refreshAmazonPages"
			        });
			        //Redirect the user to Amazon page
					setTimeout(function(){
						window.location.href = "https://www.amazon.com";
					}, 1500);
	            }else if (result && !result.status){
	            	errorState();
					$(".message").text(result.message);
	            }
	        },
	        error:function(xhr,status,error){
	        	errorState();
				$(".message").text("Something went wrong, please try again later!");
	        }
	    });
	});
	//---------------------------------------------------------------------------------//
	$("body").on("click", "#closeBtn",function(e){
		e.preventDefault();
		window.close();
	});
	//---------------------------------------------------------------------------------//
	$("body").on("click", "#refreshBtn",function(e){
		e.preventDefault();
		window.reload();
	});

	//---------------------------------------------------------------------------------//
	$("body").on("keypress","input[name='username'], input[name='password']",function(e){ 
		var key = e.which;
		if(key == 13) {
			$("#submit").click();
			return false;  
		}
		$(".sign-btn").removeClass("js-gray-btn");
	}); 
	//---------------------------------------------------------------------------------//
	function clearState(){
		$(".form-element, .form-input-element, .sign-btn").removeClass("error js-gray-btn");
	}
	//---------------------------------------------------------------------------------//
	function errorState(){
		$(".form-element, .form-input-element").addClass("error");
		$(".sign-btn span").html($(".sign-btn").attr("data-content"));
		$(".sign-btn").addClass("js-gray-btn");
	}
	//---------------------------------------------------------------------------------//
	function successState(){
		var $theBtn = $(".sign-btn span"); 
		$theBtn.fadeOut(500, function(){
			$(this).html("<img src='../images/icons/complete-active.png' />").fadeIn(500, function(){
				$(".sign-btn").fadeOut(500, function(){
					$(".sign-btn").html($(".sign-btn").attr("data-content")).fadeIn(500);
				});
			});
		}); 
	}
	//---------------------------------------------------------------------------------//
	function btnInProcess(){
		$(".sign-btn").attr("data-content", $(".sign-btn").html());
		$(".sign-btn span").html("<img src='../images/icons/loading-active.png' width='15px' height='15px' class='js-processing-btn'/>");
	}
});
