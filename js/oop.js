var Product = function(){
  this.arrayOfCoords = [];
  this.counterOfOverloading = 0;
  this.partIndex = 1;
  this.isMenu = false;
  this.usedIngredients = {};
  this.isLayerCountersCreated = [];
  this.isCache = false;
  this.rightBlock = document.getElementById('rightBlockContainer');
  this.allowPlacing = true;
  this.undoCache = [];
  this.inProgress = false;
};


var Salad = function(options){
  Product.call(this);
  for(key in options){
    this[key] = options[key];
  }
  this.productType = 'salad';
};

Salad.prototype.initializeConstructor = function(){
  var container = document.getElementById('workspaceWrapper');
		  block = document.createElement('div'),
      layerNumber = getLocalStorageValue(this.productType + 'Layer'),
      historyCache = getLocalStorageValue(this.productType + 'History');

	block.className = 'product_surface';
	block.id = 'workspace';
	container.appendChild(block);

  this.createWorkspace();
  this.toggleSizeArrows('block');
  this.changeTab(true);
  this.workspaceProperties = {
  	width: getStyles(this.workspace, 'width'),
  	height: getStyles(this.workspace, 'height')
  };
  isCartItem = false;
  this.ingredientLayerNumber = layerNumber || 3;
  this.history = JSON.parse(historyCache) || [];
  this.recreateCachedProductState();
  setTimeout(function(){
    SimpleScrollbar.initAll();
  }, 10);
};

Salad.prototype.createWorkspace = function(){
  var workspace = document.getElementById('workspace'),
      productBase = document.createElement('div'),
      layersContainer = document.createElement('div'),
      icon = 'url(../img/Center_block/' + this.productType + '_base.png)',
      plate = document.createElement('div');

  layersContainer.id = 'productSpace';
  this.workspace = layersContainer;
  plate.className = 'workspace_cooking_plate';

  var type = this.productType;
  if(type == 'pizza'){
    var sauceLayer = document.createElement('div'),
        sauceType = getLocalStorageValue(type + 'Sauce');

    if(sauceType){
      isCartItem = true;
      sauceLayer.className = sauceType;
      this.sauce = sauceType;
    }
    sauceLayer.id = 'sauceLayer';
    workspace.appendChild(sauceLayer);
  }

  productBase.className = 'product_base ' + this.productType;
  productBase.style.backgroundImage = icon;

  productBase.appendChild(layersContainer);
  workspace.appendChild(productBase);
  workspace.appendChild(plate);
}

Salad.prototype.toggleSizeArrows = function(state){
  document.querySelectorAll('.pizza_width')[0].style.display = state;
  document.querySelectorAll('.pizza_height')[0].style.display = state;
};

Salad.prototype.getListFromPhpServer = function(listName, type, callback){
	var list = this.productType + type,
      cachedList = getSessionStorageValue(list ),
      _this = this,
      parsedData;

	if(cachedList){
		parsedData = JSON.parse(cachedList);

		if(callback){
			callback.call(parsedData);
		} else {
			return parsedData;
		}
	} else {
		Ajax.request({
      url: listName,
      send: {
        institutionID: institutionID,
        product: _this.productType
      }
    }, function(){
			setSessionStorageValue(list , this);
			parsedData = JSON.parse(this);

			if(callback){
				callback.call(parsedData);
			} else {
				return parsedData;
			}
		});
	}
};

Salad.prototype.setIngredientLayer = function(data){
	var layer = document.createElement('div'),
      layerIndex = this.isCache ? data.layer : this.ingredientLayerNumber,
      maxItemsNumber = this.ingredients[data.ingredientIndex].maxAmount,
      _this = this;

  this.imgCounter = 0;
  this.allowPlacing = true;
  layer.className = 'ingredients_layer';
	layer.id = this.isMenu ? data.layer : 'ingredients_layer_' + layerIndex;
	layer.style.zIndex = this.isMenu ? data.layer : layerIndex;

	for (this.partIndex = 0; this.partIndex < maxItemsNumber; this.partIndex++) {
		var position = this.getRandomPosition();

		if(this.checkSettingPossibility(position)){
			this.passSettingStep();
		} else {
			if(this.itemIsFarEnough(position) === false) {
				this.passSettingStep();
			} else {
				this.setLayerPart(data.ingredientIndex, position, layer);
			}
		}
	}
	this.arrayOfCoords.length = [];
  this.counterOfOverloading = 0;
	this.workspace.appendChild(layer);

  if(!this.isCache && !this.isMenu){
    this.ingredientLayerNumber++;
  }
};

Salad.prototype.itemIsFarEnough = function(position){
  var coordsArray = this.arrayOfCoords;

  for(var coordIndex = 0; coordIndex < coordsArray.length; coordIndex++) {
    var element = coordsArray[coordIndex];
    var pow = {
      x: Math.pow((element.x - position.x), 2),
      y: Math.pow((element.y - position.y), 2)
    };

    if(pow.x + pow.y <= 2500){
      return false;
    }
  }
  return true;
};

Salad.prototype.getRandomPosition = function(){
  return {
    x: Math.floor(Math.random() * this.workspaceProperties.width ) + 1,
    y: Math.floor(Math.random() * this.workspaceProperties.height ) + 1,
    angle: Math.random() * 359
  };
}

Salad.prototype.setLayerPart = function(ingredientIndex, position, layer){
  var img = document.createElement('img'),
      ingr = this.ingredients[ingredientIndex];

  img.src = 'img/ingredients/' + ingr.imgPath + '/' + (this.imgCounter++ % ingr.imgNum) + '.png';
  img.style.top = position.y + 'px';
  img.style.left = position.x + 'px';
  img.style.width = img.style.height = ingr.size + 'px';
  img.style.transform = 'rotate(' + position.angle + 'deg)';
  layer.appendChild(img);

  this.counterOfOverloading= 0;
  this.arrayOfCoords[this.partIndex] = {
    x: position.x,
    y: position.y,
    id: this.partIndex
  };
};

Salad.prototype.checkSettingPossibility = function(position){
  var workspaceCenter = {
  	x: this.workspaceProperties.width / 2 - 30,
  	y: this.workspaceProperties.height / 2 - 30
  },
  pow = {
    x: Math.pow((position.x - workspaceCenter.x), 2),
    y: Math.pow((position.y - workspaceCenter.y), 2)
  },
  dividedWorkspaceHeight = this.workspaceProperties.height / 2;

  return pow.x + pow.y > Math.pow(dividedWorkspaceHeight - Math.sqrt(1800), 2);
};

Salad.prototype.passSettingStep = function(){
  this.partIndex--;
  this.counterOfOverloading++;
  if(this.counterOfOverloading >= 5000){
    this.partIndex = this.maxItems + 1;
  }
};

Salad.prototype.generateList = function(setScroll){
  var container = document.createElement('ul'),
			data = this.isMenu ? this.menuList : this.ingredients;

	container.id = 'ingredientsList';
  this.setListContent(data, container);
	this.rightBlock.appendChild(container);
  container.setAttribute('ss-container', '0');
  if(setScroll){
    setTimeout(function(){
      SimpleScrollbar.initAll();
    }, 10);
  }
};

Salad.prototype.setListContent = function(data, container){
  var typeContainer, currentIngredientType;

  if(this.isMenu){
    container.className = 'ingridientidients_yourself';
  } else {
    typeContainer = document.createElement('div');
    currentIngredientType = data[0].type;
		this.setListItemAttributes(data, typeContainer, container);
  }

  for(var item = 0; item < data.length; item++){
		var box = this.createListItem(data, item);

		if(this.isMenu){
      container.appendChild(box);
		} else {
      if(data[item].type != currentIngredientType){
				container.appendChild(typeContainer);
        typeContainer = this.createTypeContainer(data[item]);
				currentIngredientType = data[item].type;
			}
			typeContainer.appendChild(box);

			if(item == data.length - 1){
				container.appendChild(typeContainer);
			}
		}
	}
};

Salad.prototype.createTypeContainer = function(object){
  var typeContainer = document.createElement('div');
  typeContainer.id = 'ingrType_' + object.type;
  typeContainer.className = 'ingridient_catagory';
  return typeContainer;
};

Salad.prototype.createListItem = function(data, item){
  var box = document.createElement('li'),
      img = document.createElement('img');
      plus = document.createElement('span');
  if(this.isMenu){
    img.src = data[item].icon;
  } else {
    img.src = 'img/ingredients/' + data[item].imgPath + '/icon.png';
  }
  img.className = 'ingridientidient';
  img.setAttribute('alt', data[item].title);
  plus.className = 'ingridient_hover';
  if(this.isMenu){
    box.setAttribute('data-product-id', item);
    box.setAttribute('data-product-type-id', this.menuList[item].type);
  } else {
    box.setAttribute('data-add-ingr', item);
  }
  if(!this.isMenu){
    box.setAttribute('data-ingr-filter-value', data[item].type);
  }
  box.appendChild(img);
  box.appendChild(plus);

  return box;
};

Salad.prototype.setListItemAttributes = function(data, type, container){
  type.id = 'ingrType_' + data[0].type;
  type.className = 'ingridient_catagory';
  container.className = 'ingridientidients_yourself ingrs';
};

Salad.prototype.pushItemToUsedIngredients = function(index){
  var	ingrID = 'ingr_' + index;

	if(typeof this.usedIngredients[ingrID] !== 'undefined'){
		var count = this.usedIngredients[ingrID].count;

		if(count < this.ingredients[index].layerItemsNumber){
      if(this.isCache){
        this.createLayerCounterBlock(index);
      } else {
        this.changeIngredientCounterNumber(index, count);
        if(!this.isMenu){
          this.cacheCurrentProductState();
          this.history.push(index);
        }
      }
		} else {
      if(this.isCache){
        this.createLayerCounterBlock(index);
        this.history.push(index);
        return true;
      } else {
        return false;
      }
		}
	} else {
		this.usedIngredients[ingrID] = {
			count: 1,
			index: index,
			layers: [this.ingredientLayerNumber]
		};
		this.createLayerCounterBlock(index);
    if(!this.isMenu){
      this.cacheCurrentProductState();
      this.history.push(index);
    }
	}
	return true;
};

Salad.prototype.changeIngredientCounterNumber = function(index, count){
  var counterBox = document.getElementById('ingrCounter_' + index),
      ingrID = 'ingr_' + index;

  this.usedIngredients[ingrID].layers[count] = this.ingredientLayerNumber;
  counterBox.innerHTML = ++this.usedIngredients[ingrID].count;
};

Salad.prototype.createLayerCounterBlock = function(index){
  if(!this.isLayerCountersCreated[index]){
		var item = document.createElement('li');

		item.id = 'ingr_' + index;
		item.setAttribute('data-ingr', index);

		this.counterBlockHTMLTemplate(index, item);
		document.getElementById('selectedIngrs').appendChild(item);
		this.isLayerCountersCreated[index] = true;
	}
};

Salad.prototype.counterBlockHTMLTemplate = function(index, parent){
  var icon = document.createElement('img'),
			counter = document.createElement('div');

	icon.src = 'img/ingredients/' + this.ingredients[index].imgPath + '/icon.png';
	icon.setAttribute('alt', this.ingredients[index].title);

	counter.className = 'choosen_count_portion';
	counter.id = 'ingrCounter_' + index;
	counter.innerHTML = this.usedIngredients['ingr_' + index].count;

	parent.appendChild(icon);
	parent.appendChild(counter);
};

Salad.prototype.removeIngredientLayer = function(event, target, attr){
  var ingredientID = (event === false) ? target : +target.getAttribute(attr),
      id = 'ingr_' + ingredientID,
			layer = document.getElementById(id),
			list = this.usedIngredients[id].layers,
			index = list.length;

	if(this.usedIngredients[id].count < 1){
		return false;
	}
  var ingredientLayerID = 'ingredients_layer_' + list[index - 1];

	if(this.usedIngredients[id].count == 1){
    this.deleteIngredientCounterBox(ingredientID);
	} else {
    var counterBox = document.getElementById('ingrCounter_' + ingredientID);

		counterBox.innerHTML = --this.usedIngredients[id].count;
		this.usedIngredients[id].layers.pop();
	}
	if(document.getElementById('productSpace').childNodes.length == 0){
		this.ingredientLayerNumber = 3;
    removeLocalStorageValue(this.productType + 'Layers');
    isCartItem = false;
	}
  if(!this.isMenu){
    this.cacheCurrentProductState();
  }
  removeElement(document.getElementById(ingredientLayerID));
};

Salad.prototype.deleteIngredientCounterBox = function(index){
  var id = 'ingr_' + index,
      readyToBeRemovedID = 'ingr_' + index;

  removeElement(document.getElementById(readyToBeRemovedID));
  this.isLayerCountersCreated[index] = false;
  document.getElementById('ingredientPanel').style.display = 'none';
  delete this.usedIngredients[id];
};

Salad.prototype.showIngredientPanel = function(event, target, attr){
  var constructPosition = document.getElementById('regionConstructor'),
			targetPosition = target.getBoundingClientRect(),
			panel = document.getElementById('ingredientPanel'),
			ingredientInfoFields = ['title', 'weight', 'kcal', 'description'],
			controlButtons = ['add', 'del'];
			value = +target.getAttribute(attr),
      _this = this;

  constructPosition = constructPosition.getBoundingClientRect();
	clearTimeout(this.ingredientPanelTimeout);
	panel.style.left = (targetPosition.left - constructPosition.left) + 'px';
	this.changePanelData({
		obj: _this.ingredients,
		list: ingredientInfoFields,
		prefix: 'IP_',
		index: value
	});
	for(var id = 0; id < 2; id++){
    var button = document.getElementById('IP_' + controlButtons[id]);
		button.setAttribute('data-list-' + controlButtons[id] + '-ingr', value);
	}
  panel.style.display = 'block';
};

Salad.prototype.hideIngredientPanel = function(){
  this.ingredientPanelTimeout = setTimeout(function(){
		document.getElementById('ingredientPanel').style.display = 'none';
	}, 500);
};

Salad.prototype.showDescriptionBlock = function(event, target, attr){
  var container = document.getElementById('menuDescription'),
			value = +target.getAttribute(attr),
			list = ['title', 'weight', 'kcal', 'description', 'price'],
      data = this.currentTab == 0 ? this.menuList : this.ingredients,
      filterValue = +target.getAttribute('data-ingr-filter-value'),
      pigIcon = document.getElementById('pigIcon');

	this.changePanelData({
		obj: data,
		list: list,
		prefix: 'II_',
		index: value
	});


  if(filterValue == 1 || filterValue == 0){
    pigIcon.style.display = 'block';
  } else {
    pigIcon.style.display = 'none';
  }

  if(this.currentTab == 0){
    document.getElementById('II_icon').src = data[value]['icon'];
  } else {
    document.getElementById('II_icon').src = 'img/ingredients/' + data[value]['imgPath'] + '/icon.png';
  }
	container.style.display = 'block';
};

Salad.prototype.hideDescriptionBlock = function(event, target, attr){
  document.getElementById('menuDescription').style.display = 'none';
};

Salad.prototype.changePanelData = function(data){
  for(id = 0; id < data.list.length; id++){
    var field = document.getElementById(data.prefix + data.list[id]);

    field.innerHTML = data.obj[data.index][data.list[id]];
	}
};

Salad.prototype.changeTab = function(event, target, attr){
  var tabsQuery = document.querySelectorAll('.ingridientidients_tabs li'),
      value = (event === true) ? (target) ? target : 0 : +target.getAttribute(attr),
      target = event === true ? tabsQuery[value] : target,
      type = this.productType;

  if(value === 1 && (type == 'drink' || type == 'fried')){
    return false;
  }

  for(var tabIndex = 0; tabIndex < tabsQuery.length; tabIndex++){
    tabsQuery[tabIndex].removeAttribute('class');
  }
  target.className = 'active_tab';
	this.currentTab = value;
	this.loadRequestedTab(event);
};

Salad.prototype.loadRequestedTab = function(setScroll){
  var tabID = this.currentTab,
      tabContent = getSessionStorageValue('tab_' + tabID ),
      _this = this;

  this.rightBlock.innerHTML = '';
  this.getTabGeneratedContent(setScroll);
  if(tabContent){
		this.rightBlock.innerHTML += tabContent;
	} else {
		Ajax.request({
      url: 'html/rightBlock/' + tabID + '.html'
    }, function(){
			_this.rightBlock.innerHTML += this;
      setSessionStorageValue('tab_' + tabID, this);
		});
	}
};

Salad.prototype.getTabGeneratedContent = function(setScroll){
  var _this = this;
  switch(this.currentTab){
		case 0:
			this.getListFromPhpServer('json/' + this.productType + 'Menu.json', 'Menu', function(){
        _this.isMenu = true;
				_this.menuList = this;
        _this.generateList(setScroll);
        _this.isMenu = false;
			});
			break;
		case 1:
			this.getListFromPhpServer('json/' + this.productType + 'Ingredients.json', 'Ingredients', function(){
				_this.ingredients = this;
				_this.generateList(setScroll);
			});
			break;
    case 3:
      Cart.cartItemsNumber = 0;
      Cart.showAllCartItems();
	}
};

Salad.prototype.showFilteredIngredients = function(event, target, attr){
  var value = +target.getAttribute(attr),
			filterList = document.querySelectorAll('.right_block_menu > span'),
      categoryClass = '#ingredientsList .ingridient_catagory',
			categoryContainers = document.querySelectorAll(categoryClass),
			element;

	for(var box = 0; box < filterList.length; box++){
		element = document.getElementById('ingrType_' + box);
		if(element){
			element.style.display = value ? 'none' : 'inline-block';
		}
	}

	element = document.getElementById('ingrType_' + (value - 1));
	if(element){
		element.style.display = 'inline-block';
	}

	for(var filter = 0; filter < filterList.length; filter++){
		filterList[filter].removeAttribute('class');
	}
	target.className = 'active';
};

Salad.prototype.showFilteredProducts = function(event, target, attr){
  var value = +target.getAttribute(attr),
			filterList = document.querySelectorAll('.right_block_menu > span'),
      categoryClass = '#ingredientsList li',
			categoryContainers = document.querySelectorAll(categoryClass),
			element;

  for(var i = 0; i < categoryContainers.length; i++){
    if(value == 0){
      categoryContainers[i].style.display = 'inline-block';
    } else {
      var thisType = categoryContainers[i].getAttribute('data-product-type-id');

      categoryContainers[i].style.display = (value - 1 == thisType) ? 'inline-block' : 'none';
    }
  }

	for(var filter = 0; filter < filterList.length; filter++){
		filterList[filter].removeAttribute('class');
	}
	target.className = 'active';
};


Salad.prototype.cacheCurrentProductState = function(){
  var type = this.productType,
      selectedIngredients = JSON.stringify(this.usedIngredients);

  setLocalStorageValue(type + 'Layer' , this.ingredientLayerNumber);
  setLocalStorageValue(type + 'SIngredients' , selectedIngredients);
  setLocalStorageValue(type + 'History' , JSON.stringify(this.history));
};

Salad.prototype.recreateCachedProductState = function(){
  var cache = getLocalStorageValue(this.productType + 'SIngredients' ),
      _this = this, usedIngredients;

  if(cache){
    isCartItem = true;
    this.isCache = true;
    this.usedIngredients = usedIngredients = JSON.parse(cache);
    this.getListFromPhpServer('json/' + this.productType + 'Ingredients.json', 'Ingredients', function(){
      _this.ingredients = this;
    });

    for(ingredient in usedIngredients){
      var iteratedIngredient = usedIngredients[ingredient];

      for(var layerIndex = 0; layerIndex < iteratedIngredient.count; layerIndex++){
        if(this.pushItemToUsedIngredients(iteratedIngredient.index)) {
          this.setIngredientLayer({
            ingredientIndex: iteratedIngredient.index,
            layer: iteratedIngredient.layers[layerIndex]
          });
        }
      }
    }
    this.isCache = false;
  }
};

Salad.prototype.clearCache = function(){
  var keys = ['Layer', 'SIngredients', 'Sauce', 'History'];
  for(var index = 0; index < keys.length; index++){
    removeLocalStorageValue(this.productType + keys[index]);
  }
};

Salad.prototype.useProductTemplate = function(event, target, attr){
  var _this = this;

  this.killConstructor();
  this.clearCache();
  this.initializeConstructor();
  this.isMenu = true;
  this.getListFromPhpServer('json/' + this.productType + 'Ingredients.json', 'Ingredients', function(){
    _this.ingredients = this;
  });

  var dishID = +target.getAttribute(attr),
			dishData = this.menuList[dishID],
			template = dishData.template,
			layer = 3;

  if(this.productType == 'pizza'){
  	document.getElementById('sauceLayer').className = _this.sauce = dishData.sauce;
  }

	for(var ingrNum = 0; ingrNum < template.length; ingrNum++){
		for(var item = 0, ingr = template[ingrNum]; item < ingr.count; item++){
      if(this.pushItemToUsedIngredients(ingr.ingrIndex)){
        this.setIngredientLayer({
          ingredientIndex: ingr.ingrIndex,
          layer: layer++
        });
        isCartItem = true;
      }
		}
	}
  this.isMenu = false;
};

Salad.prototype.moveBack = function(){
  if(this.history.length !== 0){
    var operatedElement = this.history.pop();

    this.undoCache.push(operatedElement);
    this.removeIngredientLayer(false, operatedElement);
    this.cacheCurrentProductState();
  }
};

Salad.prototype.moveForward = function(){
  if(this.undoCache.length !== 0){
    var operatedElement = this.undoCache.pop();

    if(this.pushItemToUsedIngredients(operatedElement)){
      this.setIngredientLayer({
        ingredientIndex: operatedElement
      });
      isCartItem = true;
    }
  }
};

Salad.prototype.killConstructor = function(){
  this.usedIngredients = {};
  this.isLayerCountersCreated = [];
  this.ingredientLayerNumber = 3;
  removeElement(document.getElementById('workspace'));
	document.getElementById('selectedIngrs').innerHTML = '';
};



var Pizza = function(options){
  var _this = this;

  Product.call(this);
  this.sauce = null;
  for(key in options){
    this[key] = options[key];
  }
  this.productType = 'pizza';
};

Pizza.prototype = Object.create(Salad.prototype);
Pizza.prototype.constructor = Pizza;

Pizza.prototype.setSauceLayer = function(event, target, attr){
  var value = target.getAttribute(attr),
		  layer = document.getElementById('sauceLayer');

  isCartItem = true;
  this.sauce = value;
	switch(value){
		case 'red':
			layer.className = 'red';
			break;
		case 'white':
			layer.className = 'white';
			break;
		default:
			layer.removeAttribute('class');
			break;
	}

  setLocalStorageValue(this.productType + 'Sauce' , layer.className);
};



var Pita = function(options){
  var _this = this;

  Product.call(this);
  this.sauce = null;
  for(key in options){
    this[key] = options[key];
  }
  this.productType = 'pita';
};

Pita.prototype = Object.create(Pizza.prototype);
Pita.prototype.constructor = Pita;



var Burger = function(options){
  var _this = this;

  Product.call(this);
  this.sauce = null;
  for(key in options){
    this[key] = options[key];
  }
  this.productType = 'burger';
};

Burger.prototype = Object.create(Pizza.prototype);
Burger.prototype.constructor = Burger;

Burger.prototype.setIngredientLayer = function(data){
  var index = data.ingredientIndex;

  if(this.ingredients[index].multi){
    this.setMultiPartIngredientLayer(data);
  } else {
    this.setSinglePartIngredientLayer(data);
  }
};

Burger.prototype.setMultiPartIngredientLayer = function(data){
  var layer = document.createElement('div'),
      layerIndex = this.isCache ? data.layer : this.ingredientLayerNumber,
      maxItemsNumber = this.ingredients[data.ingredientIndex].maxAmount,
      _this = this;

  this.imgCounter = 0;
  this.allowPlacing = true;
  layer.className = 'ingredients_layer';
	layer.id = this.isMenu ? data.layer : 'ingredients_layer_' + layerIndex;
	layer.style.zIndex = this.isMenu ? data.layer : layerIndex;

	for (this.partIndex = 0; this.partIndex < maxItemsNumber; this.partIndex++) {
		var position = this.getRandomPosition();

		if(this.checkSettingPossibility(position)){
			this.passSettingStep();
		} else {
			if(this.itemIsFarEnough(position) === false) {
				this.passSettingStep();
			} else {
				this.setLayerPart(data.ingredientIndex, position, layer);
			}
		}
	}
	this.arrayOfCoords.length = [];
  this.counterOfOverloading = 0;
	this.workspace.appendChild(layer);

  if(!this.isCache && !this.isMenu){
    this.ingredientLayerNumber++;
  }
};

Burger.prototype.setSinglePartIngredientLayer = function(data){
  var layer = document.createElement('div'),
      layerIndex = this.isCache ? data.layer : this.ingredientLayerNumber,
      img = document.createElement('img'),
      ingredient = this.ingredients[data.ingredientIndex],
      _this = this;

  this.allowPlacing = true;
  layer.className = 'ingredients_layer burger';
	layer.id = this.isMenu ? data.layer : 'ingredients_layer_' + layerIndex;
	layer.style.zIndex = this.isMenu ? data.layer : layerIndex;
  img.src = 'img/ingredients/' + ingredient.imgPath + '/0.png';

  layer.appendChild(img);
	this.workspace.appendChild(layer);

  if(!this.isCache && !this.isMenu){
    this.ingredientLayerNumber++;
  }
};



var Drink = function(options){
  Product.call(this);
  for(key in options){
    this[key] = options[key];
  }
  this.productType = 'drink';
};

Drink.prototype = Object.create(Salad.prototype);
Drink.prototype.constructor = Drink;

Drink.prototype.initializeConstructor = function(){
  var container = document.getElementById('workspaceWrapper');
		  block = document.createElement('div'),
      _this = this;

	block.className = 'product_surface';
	block.id = 'workspace';

  if(this.productType == 'fried'){
    var plate = document.createElement('div');

    plate.className = 'workspace_cooking_plate';
    plate.id = 'workspacePlate';
    block.appendChild(plate);
  }
	container.appendChild(block);

  this.toggleSizeArrows('none');
  this.changeTab(true);
  isCartItem = true;
  setTimeout(function(){
    SimpleScrollbar.initAll();
    _this.useProductTemplate(false);
  }, 0);
};

Drink.prototype.useProductTemplate = function(event, target, attr){
  var container = document.getElementById(this.productType == 'fried' ? 'workspacePlate' : 'workspace'),
      value = (event === false) ? 0 : +target.getAttribute(attr),
      img = document.createElement('img');

  container.innerHTML = '';
  img.src = this.menuList[value].icon;
  container.appendChild(img);
};



var Fried = function(options){
  Product.call(this);
  for(key in options){
    this[key] = options[key];
  }
  this.productType = 'fried';
};

Fried.prototype = Object.create(Drink.prototype);
Fried.prototype.constructor = Fried;
