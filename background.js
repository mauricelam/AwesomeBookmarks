var Notifier = {};

var queryInterval = 0.5; //number of minutes between each query
var frequentQueryInterval = 3; // number of seconds for pages currently active
var storedNotify = {};

(function(){

    var m = Notifier;

    var notifyId = 'cepkiiaikapljlmgjlipdnafoeojbepp';

    m.loadNotification = function(node){
        if(node.url !== undefined){
            // ask no.tify for information
            chrome.extension.sendRequest(notifyId, {'action': 'getNotify', 'url': node.url}, function(response){
                if(response && response.notify !== storedNotify[node.id]){
                    onNotifyChanged(node, node.id, response);
                    if(node.parentId !== undefined){
                        bubbleNotify(node.parentId, node.id, response);
                    }
                }
            });
        }
        if(node.children){
            for(var i in node.children){
                m.loadNotification(node.children[i]);
            }
        }
    };

    // bubble the notification up the tree
    function bubbleNotify(target, changedId, notify){
        var node = getNodeById(root, target);
        onNotifyChanged(node, changedId, notify);
        if(node.parentId && node.id != bar.id){
            bubbleNotify(node.parentId, changedId, notify);
        }
    }

    m.getTotalCount = function(){
        var total = 0;
        for(var i in myBookmarks){
            total += myBookmarks[i].notify;
        }
        return total;
    };

    function getNotifySuffix(notify, mode){
        var output = '';
        if(notify>0){
            if(mode==5)
                output = ' *';
            else
                output = ' (' + notify + ')';
        }
        return output;
    }

})();

function onNotifyChanged(target, changedId, notify){
    if(target.id == bar.id){
        // update counter on browser action if root
        var n = getChildrenNotify(target);
        storedNotify[target.id] = n;
        setCounter(n);
        showCounter();
        updateCounter(n);
    }else if(target.id == changedId){
        // update bookmark name if leaf
        NameChanger.changeBookmarkName(target, notify.notify, notify.mode);
        storedNotify[target.id] = notify.notify;
    }else{
        // update folder name if internal node
        var n = getChildrenNotify(target);
        storedNotify[target.id] = n;
        NameChanger.changeBookmarkName(target, n, 3);
    }
}


function getChildrenNotify(node){
    var total = 0;
    //console.log("children", node);
    for(var i in node.children){
        var notify = storedNotify[node.children[i].id];
        if(node.title == 'Reading')
            console.log('children', node.children[i], storedNotify);
        if(notify !== undefined){
            total += notify;
        }
    }
    return total;
}

var root, bar;
var timer = 0;

$(function(){
    setTimeout(function(){
        chrome.bookmarks.getTree(function (tree){
            root = tree;
            bar = getBookmarksBar(tree);
            Notifier.loadNotification(bar);
            createNotifyLoop();
        });
    }, 5000);
});

chrome.extension.onRequest.addListener(function listen_request(request, sender, sendResponse){
	console.log('Internal request received');
	if(request.action == 'refresh'){
		if(isEnabled()){
			console.log('Refresh request is deprecated');
		}
	}else if(request.action == 'disable'){
        disable();
	}else if(request.action == 'enable'){
        createNotifyLoop();
	}
});

function createNotifyLoop(){
    timer = setInterval(function(){
        Notifier.loadNotification(bar);
    }, queryInterval * 60000);
}

function disable(){
    clearInterval(timer);
}


chrome.contextMenus.create({
    'contexts': ['link'], 
    'documentUrlPatterns': ['chrome-extension://faonjcpbmjjkknfgoajmjadgdimkhacm/popup.html'],
    'title': 'Delete',
    'onclick': function (info, tab) {
        var bookmark = BookmarksManager.getNodeByUrl(root, info.linkUrl);
        chrome.bookmarks.remove(bookmark.id);
    }
});

chrome.contextMenus.create({
    'contexts': ['link'],
    'documentUrlPatterns': ['chrome-extension://faonjcpbmjjkknfgoajmjadgdimkhacm/popup.html'],
    'title': 'Edit...',
    'onclick': function (info, tab) {
        var width = 400, height = 150;
        chrome.windows.getCurrent(function(window){
            if(!window) return;
            var left = window.left + window.width/2 - width/2;
            var top = window.top + window.height/2 - height/2;
            var bookmark = BookmarksManager.getNodeByUrl(root, info.linkUrl);
            chrome.windows.create({url: 'dialog.html#' + bookmark.id, left: parseInt(left), top: parseInt(top), width: width, height: height, type: 'popup'});
        });
    }
});
