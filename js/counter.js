var counter = 0;
function updateCounter(num){
	counter += num;
}
function showCounter(){
    var text = counter+"";
    if(counter==0) text = "";
    chrome.browserAction.setBadgeText({"text": text});
    //notifyFolders();
}
function setCounter(num){
    counter = num;
}
function resetCounter(){
	counter = 0;
}

function notifyFolders(){
	chrome.bookmarks.getTree(function(tree){
		var bar = getBookmarksBar(tree).children;
		showFolderNotify(bar);
	});
}

function showFolderNotify(nodes){
	for(var i in nodes){
		if(nodes[i].children){
			var notify = folders[nodes[i].id];
			updateFolderName(nodes[i], notify);
			showFolderNotify(nodes[i].children);
		}
	}
}

function updateFolderName(folder, number){
	var id = folder.id;
	var oldTitle = getTitle(folder);
	var notify = number;
	var suffix = getNotifySuffix(notify, 1)
	var title = oldTitle + suffix;
	saveNotifyName(id, suffix);

	console.log(oldTitle+" -> "+folder.title+" => "+title);
	if(title!=getShownName(folder)){
		changeBookmarkName(id, title, true);
	}
}
