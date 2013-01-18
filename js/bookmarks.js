var BookmarksManager = {};

(function(){
    var m = BookmarksManager;

    m.getNodeByUrl = function(tree, url){
        for(var i=0; i<tree.length; i++){
            var bm = tree[i];
            if(bm){
                if(url.indexOf(bm.url) != -1){
                    return bm;
                }
                if(bm.children){
                    // recursion
                    child = m.getNodeByUrl(bm.children, url);
                    if(child) return child;
                }
            }
        }
        return null;
    }
})();

function getBookmarksBar(tree){
	return getNodeById(tree, 1);
}

function printBookmarkBar(callback){
	chrome.bookmarks.getTree(function(tree){
		var bar = getBookmarksBar(tree);
		printBookmarks(bar.children);
		if(typeof callback == "function") callback();
	});
}

function printBookmarksById(id, callback){
	$("#wrapper").html("");
	chrome.bookmarks.getTree(function(tree){
		console.log(id);
		var bookmarks = getNodeById(tree, id).children;
		printBookmarks(bookmarks);
		if(id != 1){
			var backBtn = $("<a href='#' target='_blank' class='abwrap horizontal'></a>").mouseover(function(){
				hilight(false);
			}).html("<img src='images/back.png' id='backBtn' class='favicon' />").click(function(){
				$(this).trigger("leftMouse", {source: "mouse"});
			}).bind("leftMouse", function(){
				upOneFolder(id);
			});
			$("#wrapper").prepend(backBtn);
		}
		if(typeof callback == "function") callback();
	});
}

function getNodeById(tree, id){
	for(var i=0; i<tree.length; i++){
		var bm = tree[i];
		if(bm){
			if(bm.id == id){
				console.log(bm.id, id);
				return bm;
			}
			if(bm.children){
				child = getNodeById(bm.children, id);
				if(child) return child;
			}
		}
	}
	console.log("No node is found with id "+id);
	return null;
}

// Go up one folder from the one specified by ID
function upOneFolder(id){
	if(id==1) return; //return if already at Bookmarks Bar folder
	chrome.bookmarks.get(id, function(bookmark){
		printBookmarksById(bookmark[0].parentId, null);
	});
}

function printBookmarks(tree){
	for(var i=0; i<tree.length; i++){
		var bm = tree[i];
		if(bm.title){
			addToList(bm);
		}
		if(PrefManager.getOption("flattenFolders") && bm.children){
			printBookmarks(bm.children);
		}
	}
}
