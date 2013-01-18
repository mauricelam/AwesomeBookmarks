var NameChanger = {};

(function(){
    var m = NameChanger;

    m.changeBookmarkName = function(node, notify, mode){
        var name = m.getBookmarkName()[node.id];
        if(name === undefined){
            m.updateBookmarkName(node.id, node.title);
        }
        var oldTitle = m.getBookmarkName()[node.id];
        changeBookmarkName(node.id, oldTitle + getNotifySuffix(Number(notify), mode));
    }

    function getNotifySuffix(notify, mode){
        var output = "";
        if(notify>0){
            if(mode==5)
                output = " *";
            else
                output = " ("+notify+")";
        }
        return output;
    }

    function changeBookmarkName(id, name){
        if(!PrefManager.getOption("maintainName")){
            changedBookmarks = id;
            // update only if bookmark name is changed to save quotas
            chrome.bookmarks.get(id, function(nodes){
                console.log("checking bookmark name", id, nodes[0].title, name);
                if(nodes[0].title != name){
                    chrome.bookmarks.update(id, {"title": name}, function(){
                        console.log("Bookmark name updated");
                    });
                }
            });
        }
    }

    m.getBookmarkName = function(){
        var names = localStorage["bookmarkName"];
        if(!names) names = "{}";
        var obj = JSON.parse(names);
        return obj;
    }

    m.updateBookmarkName = function(id, name){
        console.log(id, name);
        var bookmarks = m.getBookmarkName();
        bookmarks[id] = name;
        var str = JSON.stringify(bookmarks);
        localStorage["bookmarkName"] = str;
    }

})();

function buildRegex(str){
    var specials = new RegExp("[.*+?|()\\[\\]{}\\\\]", "g");
    var build = str.replace(specials, "\\$&");
    return build;
}

chrome.bookmarks.onChanged.addListener(function listen_change(id, changeInfo){
        if(changedBookmarks==id){
            console.log("Bookmark name changed by this extension. Ignore.");
            return;
        }
        var obj = NameChanger.getBookmarkName();
        var text = obj[id];
        var title = changeInfo.title;
        var regex = false;
        console.log("Bookmark name "+text+" changed. Saving name now", changeInfo);
        if(text){
            regex = new RegExp("^"+buildRegex(text)+" \\(\\d{1,3}\\)$", "");
        }else{
            console.log("old title is undefined", text);
        }
        if(regex && title.match(regex)){
            /*if(debug){
                alert("There is a bug. Sorry. ");
                console.log("BUG!!!!!!!!!!!!!!!!");
                console.log("Bookmark name change by extension gets to the safety net");
                console.log("oldTitle:", text, "title:", title, "id:", id, "regex:", regex);
            }*/
            return;
        }
        console.log("Not changed by extension, changedBookmark: "+changedBookmarks+" : "+id);
        obj[id] = title;
        console.log(obj);
        localStorage["bookmarkName"] = JSON.stringify(obj);
});

chrome.bookmarks.onRemoved.addListener(function listen_remove(id, removeInfo){
        console.log("Bookmark removed. Removing from localStorage");
        var obj = NameChanger.getBookmarkName();
        delete obj[id];
        localStorage["bookmarkName"] = JSON.stringify(obj);
});
