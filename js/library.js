var EventHandler = {
	on: function(options, success){
		document.addEventListener(options.action, function(event){
			var target = event.target;
			while(target != document){
				if(target.getAttribute(options.attr)){
					success(event, target, options.attr);
					return;
				}
				target = target.parentNode;
			}
		}, false);
	}
};

var Ajax = {
	getXHR: function(){
  	var xhr;
  	try {
    	xhr = new ActiveXObject("Msxml2.XMLHTTP");
  	} catch (e) {
    	try {
      	xhr = new ActiveXObject("Microsoft.XMLHTTP");
    	} catch (E) {
      	xhr = false;
    	}
  	}
  	if (!xhr && typeof XMLHttpRequest != 'undefined') {
    	xhr = new XMLHttpRequest();
  	}
  	return xhr;
	},
	request: function(options, callback){
		var xhr = this.getXHR(),
		 		onSendData = options.send ? JSON.stringify(options.send) : null,
				method = options.method || 'GET';

		xhr.open(method, options.url, true);
		xhr.send(onSendData);
		xhr.onreadystatechange = function(){
			if(xhr.readyState == 4 && xhr.status == 200){
				callback.call(xhr.responseText);
			}
		};
	}
};

function addClass(DOM_Element, className){
	DOM_Element.classList.add(className);
}

function removeClass(DOM_Element, className){
	DOM_Element.classList.remove(className);
}

function getStyles(DOM_Element, property){
	var propertyValue = getComputedStyle(DOM_Element)[property];
	return +propertyValue.substr(0, propertyValue.length - 2);
}

function removeElement(DOM_Element){
	DOM_Element.parentNode.removeChild(DOM_Element);
}

function setLocalStorageValue(key, value){
  if(typeof Storage !== 'undefined'){
    localStorage.setItem(key, value);
  }
}

function setSessionStorageValue(key, value){
  if(typeof Storage !== 'undefined'){
    sessionStorage.setItem(key, value);
  }
}

function getLocalStorageValue(item){
	if(typeof Storage !== 'undefined'){
		return localStorage.getItem(item);
	} else {
		return false;
	}
}

function getSessionStorageValue(item){
	if(typeof Storage !== 'undefined'){
		return sessionStorage.getItem(item);
	} else {
		return false;
	}
}

function removeLocalStorageValue(item){
	if(typeof Storage !== 'undefined'){
		localStorage.removeItem(item);
	}
}

function removeSessionStorageValue(item){
	if(typeof Storage !== 'undefined'){
		sessionStorage.removeItem(item);
	}
}

function isEmptyObject(object){
	for(key in object){
		if(object.hasOwnProperty(key)){
			return false;
		}
	}
	return true;
}
