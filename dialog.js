var bookmark;

$(function(){
	console.log("onload");
	chrome.bookmarks.get(getId(), function(result){
		console.log(result);
		bookmark = result[0];
		$("#bmTitleBox").val(bookmark.title);
		if(bookmark.url){
			$("#bmUrlBox").val(bookmark.url);
		}else{
			$("#bmUrlBox").attr("disabled", "disabled");
		}
		$("#bmTitleBox").focus();
		$("#bmTitleBox").select();
	});

	$(document).keyup(function(e){
		if(e.keyCode==13){
			//Enter key
			save();
		}else if(e.keyCode==27){
			//Esc key
			cancel();
		}
	});
	$("#deleteBtn").click(function(){
		remove();
	});
	$("#managerBtn").click(function(){
		manager();
	});
	$("#cancelBtn").click(function(){
		cancel();
	});
	$("#okBtn").click(function(){
		save();
	});
});

function getId(){
	var url = document.URL;
	var id = url.substr(url.indexOf("#")+1);
	console.log(id);
	return id;
}

function getTitle(){
	return $("#bmTitleBox").val();
}

function getUrl(){
	return $("#bmUrlBox").val();
}

function save(){
	chrome.bookmarks.update(bookmark.id, {title: getTitle(), url: getUrl()}, function(node){
		console.log("updated");
		console.log(node);
		window.close();
	});
}

function cancel(){
	window.close();
}

function remove(){
	if(confirm("Delete bookmark \""+bookmark.title+"\"?")){
		chrome.bookmarks.remove(bookmark.id, function(){
			console.log("deleted");
			window.close();
		});
	}
}

function manager(){
	var url = "chrome-extension://eemcgdkfndhakfknompkggombfjjjeno/main.html#"+bookmark.parentId;
	chrome.tabs.create({"url": url, "selected": true});
	window.close();
}
