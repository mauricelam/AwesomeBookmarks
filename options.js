var notifyId = "cepkiiaikapljlmgjlipdnafoeojbepp";

/*** model ***/
$(function(){
	checkNotify();
	checkbox($("#maintainName"), PrefManager.getOption("maintainName"));
	checkbox($("#flattenFolders"), PrefManager.getOption("flattenFolders"));

	enable(false); //re-enable if the options page is opened again

	$("#maintainName").click(function(){
		var value = $(this).attr("checked");
		PrefManager.setOption("maintainName", value);
		if(Boolean(value)){
			clean();
		}else{
			clearNotifyNames();
		}
	});
	$("#flattenFolders").click(function(){
		var value = $(this).attr("checked");
		PrefManager.setOption("flattenFolders", value);
	});
	$("#cleanHeader").click(function(){
		cleanAndDisable();
		$(this).parent().hide();
		return false;
	});
	$("#enableBtn").click(function(){
		enable(true);
		$(this).hide();
		$("#cleanBtn").show();
		return false;
	});
});

/*** end model ***/

/*** controller ***/
function cleanAndDisable(){
	clean();
	localStorage["bookmarkName"] = "{}";
	disable();
	showMessage();
	$("#enableBtn").show();
}

function getBookmarkName(){
	var string = localStorage["bookmarkName"];
	if(!string) return [];
	var obj = JSON.parse(string);
	if(!obj) return [];
	return obj;
}

function clean(){
	var obj = getBookmarkName();
	if(obj){
		for(var i in obj){
			changeBookmarkName(i, obj[i]);
		}
	}
}

function changeBookmarkName(id, title){
	chrome.bookmarks.get(id, function(bm){
		if(bm[0].title!=title){
			chrome.bookmarks.update(id, {"title": title});
		}
	});
}

function checkNotify(){
	setNotify(false);
	chrome.extension.sendMessage(notifyId, {"action": "ping"}, function(reply){
		if(reply=="pong"){
			setNotify(true);
		}
	});
}
/*** end controller ***/

/*** view ***/
function checkbox(obj, value){
	if(value){
		obj.attr("checked", "checked");
	}else{
		obj.removeAttr("checked");
	}
}

function trace(msg, color){
	if(color=="red") color = "#AA0000";
	else if(color=="green") color = "#11772D";
	else if(color=="black") color = "#333333";
	$("#trace").text(msg);
	$("#trace").css("color", color);
}

function setNotify(notify){
	if(notify){
		$(".notify").show();
		$("#enableBtn").hide();
		$(".no_notify").hide();
	}else{
		$(".notify").hide();
		$(".no_notify").show();
	}
}

function showMessage(){
	trace("You can now safely disable or uninstall this extension.", "red");
	var box = document.getElementById("cleanBtn");
	box.onclick = function(){};
}

function disable(){
	chrome.extension.sendMessage({"action": "disable"});
	chrome.browserAction.setBadgeBackgroundColor({"color": [0, 0, 0, 255]});
	chrome.browserAction.setBadgeText({"text": "N/A"});
}

function enable(showMsg){
	if(showMsg)
		trace("You can now continue using Awesome Bookmarks with notifications", "green");
	chrome.browserAction.setBadgeBackgroundColor({"color": [255, 0, 0, 255]});
	chrome.extension.sendMessage({"action": "enable"});
}
/*** end view ***/
