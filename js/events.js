var EventsManager = {};

(function(){
    var m = EventsManager;
    var oldTab = null;

    m.updateTimer = 0;

    function onUpdate(url){
        var node = BookmarksManager.getNodeByUrl(root, url);
        if(node){
            Notifier.loadNotification(node);
            console.log("loading notification", node);
        }
    }
    
    m.callUpdate = function(){
        chrome.tabs.getSelected(null, function(tab){
            if(tab && tab.url){
                onUpdate(tab.url);
                oldTab = tab.url;
            }
        });
    }

    m.callRemove = function(){
        onUpdate(oldTab);
    }

    m.createTimer = function(){
        m.updateTimer = setInterval(function(){
            EventsManager.callUpdate();
        }, frequentQueryInterval*1000);

        chrome.tabs.onRemoved.addListener(m.callRemove);
    }
    
    m.cancelTimer = function(){
        clearInterval(m.updateTimer);

        chrome.tabs.onRemoved.removeListener(m.callRemove);
    }

})();

$(function(){
    EventsManager.createTimer();
});
