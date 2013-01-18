var notifyOthers = false;

//system variables
var hilighted = 0;
var navLeft;

$(function(){
	printBookmarkBar(function(){
		var firstLink = document.getElementById("wrapper").firstChild;
		navLeft = getElementWidth(firstLink)/2 + firstLink.offsetLeft;
	});


	$("#searchBox").keydown(function(e){
		if(e.keyCode>=37 && e.keyCode<=40){
			$(this).delegate($(document), "keydown", function(e){
				type(e);
			});
			return false;
		}
	});
	$("#searchBox").keyup(function(e){
		if(e.keyCode>=37 && e.keyCode<=40){
			return false;
		}
		console.log("search");
		searchBookmarks(this.value);
	});
	$(document).keydown(function(e){ type(e); });
	$("#wrapper").click(function(e){
		this.blur();
		return false;
	});
});

function type(event){
	if($("#searchBox").val().length==0){
		$("#searchBox").blur();
	}
	console.log(event.keyCode);
	if(event.keyCode==13){
		navLeft = 0;
		hilighted = 0;
		console.log("Enter");
		var obj = $("#wrapper .abwrap.hover");
		if(!event.altKey){
			obj.trigger("leftMouse", {source: "keyboard", altKey: event.altKey});
		}else{
			obj.trigger("middleMouse", {source: "keyboard", altKey: event.altKey});
		}
		return;
	}else if(event.keyCode==37){
		console.log("left arrow");
		hilight(-1);
		return false;
	}else if(event.keyCode==39){
		console.log("right arrow");
		hilight(1);
		return false;
	}else if(event.keyCode==40){
		console.log("down arrow");
		hilight(4);
		return false;
	}else if(event.keyCode==38){
		console.log("up arrow");
		hilight(-4);
		return false;
	}else if(event.keyCode==8){ //backspace
		if($("#searchBox").val().length == 0){
			$("#backBtn").trigger("leftMouse", {source: "backspace"});
			return false;
		}else{
			return true;
		}
	}
	$("#searchBox").focus();
}

function searchBookmarks(needle){
	$("#wrapper").html("");

	if(needle===""){
		printBookmarkBar(null);
	}else{
		chrome.bookmarks.search(needle, function(results){
			$("#wrapper").html("");
			for(var i in results){
				addToList(results[i]);
			}
			hilight(0);
		});
	}
}

function hilight(direction){
	var links = $("a.abwrap");
	links.each(function(){
		$(this).removeClass("hover");
	});
	if(direction!==false){
		if(direction==0){
			hilighted = 0;
		}
		var wrap = document.getElementById("wrapper");
		var obj = wrap.firstChild;
		for(var i=0; i<hilighted; i++){
			obj = obj.nextSibling;
		}
		if(direction==0){
			navLeft = getElementWidth(obj)/2 + obj.offsetLeft;
		}else if(direction==1 || direction==-1){
			console.log("left right");
			var tempObj = horizontalNavigate(obj, direction);
			if(tempObj) obj = tempObj;
		}else if(direction==4 || direction==-4){
			obj = verticalNavigate(obj, direction);
		}
		$(obj).addClass("hover");
		var dscroll = outOfScreen(obj);
		wrap.scrollTop += dscroll;
	}
}

function outOfScreen(obj){
	var par = obj.parentNode;
	var parentH = getElementHeight(par);
	var down = getElementHeight(obj)+8-(parentH-(obj.offsetTop-par.scrollTop));
	if(down>0) return down;
	var up = obj.offsetTop - par.scrollTop;
	if(up<0) return up;
	return 0;
}

function horizontalNavigate(obj, direction){
	obj = getSibling(obj, direction);
	if(!obj) return false;
	hilighted += sign(direction);
	navLeft = getElementWidth(obj)/2 + obj.offsetLeft;
	return obj;
}

function verticalNavigate(obj, direction){
	var oldObj = obj;
	var oldHilight = hilighted;
	var top = obj.offsetTop;
	while(obj.offsetTop==top){
		if(!getSibling(obj, direction)){
			hilighted = oldHilight;
			obj = oldObj;
			break;
		}
		obj = getSibling(obj, direction);
		hilighted += sign(direction);
	}
	while(!inLine(obj, navLeft)){
		if(!getSibling(obj, direction)){
			break;
		}
		obj = getSibling(obj, direction);
		hilighted += sign(direction);
	}
	return obj;
}

function inLine(obj, line){
	return navLeft>=obj.offsetLeft && navLeft<=obj.offsetLeft+getElementWidth(obj);
}

function sign(num){
	return num/Math.abs(num);
}

function getSibling(obj, dir){
	if(dir>0) return obj.nextSibling;
	if(dir<0) return obj.previousSibling;
}

/*function getWrapperHeight(){
	return $("#wrapper").height();
}*/

function addToList(bookmark){
	var title = bookmark.title;
	if(PrefManager.getOption("maintainName")){
		var temp = getNotifyName(bookmark.id);
		if(temp) title += temp;
	}
	var url = bookmark.url;
	if(PrefManager.getOption("flattenFolders") && !url) return; //don't add folders to the bar
	var div = $("<a href='"+url+"' target='_blank' class='abwrap horizontal'></a>").mouseover(function(){
		hilight(false);
	});
	div.bind("leftMouse", function(e, extra){
		if(url){
			goToPage(url, {"newTab": extra.ctrlKey, "selected": !extra.ctrlKey});
		}else{
			openFolder(bookmark);
		}
	}).bind("middleMouse", function(){
		if(url){
			goToPage(url, {"newTab": true, "selected": false});
		}else{
			var count = countTree(bookmark.children);
			if(count<10 || confirm("Are you sure you want to open "+count+" tabs?")){
				openFolderNewTab(bookmark.children);
			}
		}
	}).bind("rightMouse", function(){
		createDialog(bookmark);
	});
	div.click(function(e){
		if(e.which == 1){
			div.trigger("leftMouse", {"source": "mouse", "ctrlKey": e.ctrlKey});
			return false;
		}
	});
	div.mouseup(function(e){
		if(e.which==3) {
			// div.trigger("rightMouse");
		} else if (e.which==2)
			div.trigger("middleMouse");
		return false;
	});
	var link = $("<span class='abookmark'></span>").html(title);
	var icon = $("<img class='favicon' src='"+getFavicon(url)+"' />");

	div.append(icon).append(link);
	$("#wrapper").append(div);

	return true;
}

function openFolder(bookmark){
	printBookmarksById(bookmark.id, null);
}

function countTree(tree){
	var count = 0;
	for(var i in tree){
		if(tree[i].url){
			count++;
		}else if(tree[i].children){
			count += countTree(tree[i].children);
		}
	}
	return count;
}

function openFolderNewTab(tree){
	for(var i in tree){
		if(tree[i].url){
			goToPage(tree[i].url, {"newTab": true, "selected": false});
		}else if(tree[i].children){
			openFolderNewTab(tree[i].children);
		}
	}
}

function getFavicon(url){
	if(url){
		return "chrome://favicon/"+url;
	}else{
		return "images/folder.png";
	}
}

function createDialog(bookmark){
	var width = 400, height = 150;
	chrome.windows.getCurrent(function(window){
		if(!window) return;
		var left = window.left + window.width/2-width/2;
		var top = window.top + window.height/2-height/2;
		chrome.windows.create({url: "dialog.html#"+bookmark.id, left: parseInt(left), top: parseInt(top), width: width, height: height, type: "popup"});
	});
}

function goToPage(url, options){
	var newTab = (options&&options.newTab!==undefined) ? options.newTab : false;
	var selected = (options&&options.selected!==undefined) ? options.selected : true;
	if(newTab){
		chrome.tabs.create({"url": url, "selected": selected});
	}else{
		chrome.tabs.getSelected(null, function(tab){
			chrome.tabs.update(tab.id, {"url":url}, function(){ 
				console.log("tab updated");
		   	});
			window.close();
		});
	}
}

function getElementWidth(obj){
	return $(obj).width();
}
function getElementHeight(obj){
	return $(obj).height();
}
