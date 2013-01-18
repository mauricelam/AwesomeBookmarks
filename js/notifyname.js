function saveNotifyName(id, name){
	var names = getNotifyNames();
	if(!names) names = {};
	names[id] = name;
	localStorage["notifyNames"] = JSON.stringify(names);
	//console.log("Notify name saved");
}

//get a notify name from its id
function getNotifyName(id){
	var names = getNotifyNames();
	if(!names) return false;
	return names[id];
}

function getNotifyNames(){
	var names = localStorage["notifyNames"];
	if(!names) return false;
	notifyNames = JSON.parse(names);
	if(!notifyNames) return false;
	return notifyNames;
}

function clearNotifyNames(){
	localStorage["notifyNames"] = "";
}
