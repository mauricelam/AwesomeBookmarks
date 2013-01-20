var EventsManager = {};

(function(){

    var oldTab = null;
    EventsManager.updateTimer = 0;

    function onUpdate(url){
        if (window.root === undefined)
            return;

        var node = BookmarksManager.getNodeByUrl(root, url);
        if(node){
            Notifier.loadNotification(node);
            console.log("loading notification", node);
        }
    }
    
    EventsManager.callUpdate = function(){
        chrome.tabs.getSelected(null, function(tab){
            if(tab && tab.url){
                onUpdate(tab.url);
                oldTab = tab.url;
            }
        });
    };

    EventsManager.callRemove = function(){
        onUpdate(oldTab);
    };

    EventsManager.createTimer = function(){
        EventsManager.updateTimer = setInterval(function(){
            EventsManager.callUpdate();
        }, frequentQueryInterval*1000);

        chrome.tabs.onRemoved.addListener(EventsManager.callRemove);
    };
    
    EventsManager.cancelTimer = function(){
        clearInterval(EventsManager.updateTimer);

        chrome.tabs.onRemoved.removeListener(EventsManager.callRemove);
    };

})();

$(function(){
    EventsManager.createTimer();
});
