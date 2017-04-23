var _this,
    pizzaSize = 20,
    isCartItem = false,
    dialogWindowTimeout,
    institutionID = null,
    onStartConstructor = true;

var Constructor = {
  onLoadConstructor: function(){
    localStorage.clear();
    Constructor.ActiveConstructor = Constructor.getRequiredConstructor('pizza');
    Constructor.ActiveConstructor.clearCache();
    Constructor.ActiveConstructor.initializeConstructor();
  },
  changeConstructor: function(event, target ,attr){
    var value = (event === true) ? 'pizza' : target.getAttribute(attr);

    Constructor.ActiveConstructor.clearCache();
    Constructor.ActiveConstructor.killConstructor();
    Constructor.ActiveConstructor = Constructor.getRequiredConstructor(value);
    Constructor.ActiveConstructor.initializeConstructor();
  },
  getRequiredConstructor: function(key){
    var constructorName;
    switch(key){
      case 'pizza':
        constructorName = new Pizza();
        break;
      case 'salad':
        constructorName = new Salad();
        break;
      case 'pita':
        constructorName = new Pita();
        break;
      case 'drink':
        constructorName = new Drink();
        break;
      case 'fried':
        constructorName = new Fried();
        break;
      case 'burger':
        constructorName = new Burger();
        break;
    }
    _this = constructorName;
    return constructorName;
  }
};

var Cart = {
  productsList: [],
  cartIsCreated: false,
  cartItemsNumber: 0,
  generalCost: 0,
  generalKcal: 0,
  showAllCartItems: function(){
    var list = this.productsList;

    this.cartItemsNumber = 0;
    for(var item = 0; item < list.length; item++){
      if(list[item]){
        this.addToCart(item, false, _this);
      }
    }
    setTimeout(function(){
      SimpleScrollbar.initAll();
    }, 0);
  },
  createCartContainer: function(){
    if(!this.cartIsCreated){
  		var container = document.createElement('ul');
  		container.className = 'basket_content';
  		container.id = 'cartContainer';
      container.setAttribute('ss-container', 0);
  		document.getElementById('rightBlockContainer').appendChild(container);
  		this.cartIsCreated = true;
  	}
  },
  setGeneralCartValues: function(){
    var cost = document.getElementById('generalCost'),
  			kcal = document.getElementById('generalKcal'),
        finalCost = document.getElementById('finalCost');

  	if(this.generalCost.toFixed(2) == 0){
  		cost.innerHTML = 0;
      finalCost.innerHTML = '0 $';
  	} else {
  		cost.innerHTML = this.generalCost.toFixed(2);
      finalCost.innerHTML = this.generalCost.toFixed(2) + ' $';
  	}
  	kcal.innerHTML = this.generalKcal + ' Ккал';
  },
  addToCart: function(index, reset, parent, id){
    this.createCartContainer();
    this.cartItemTemplate(index, reset, parent, id);
  	this.setGeneralCartValues();
  	if(reset){
  		parent.clearCache();
  		parent.killConstructor();
  		parent.initializeConstructor();
  	}
  },
  removeCartItem: function(event, target, attr){
    var value = +target.getAttribute(attr),
        cartItem = this.productsList[value];

  	this.generalCost -= cartItem.price * cartItem.count + .00005;
  	this.generalKcal -= cartItem.kcal * cartItem.count;
  	this.productsList[value] = null;
    this.setGeneralCartValues();
  	removeElement(target.parentNode);
  },
  calculateNumericalOptions: function(parent){
    var options = {
  		price: 0,
  		kcal: 0
  	};

  	for(key in parent.usedIngredients){
      var currentOption = parent.usedIngredients[key],
  		    ingredient = parent.ingredients[currentOption.index],
  		    count = currentOption.count;

  		options.kcal += ingredient.kcal * count;
  		options.price += ingredient.price * count;
  		options.price = +(+options.price + 0.00005).toFixed(2);
  	}
  	return options;
  },
  generateReadyIngredientList: function(parent){
  	var list = ' ';
  	for(key in parent.usedIngredients){
  		var ingredient = parent.usedIngredients[key],
  				count = ingredient.count;

  		list += parent.ingredients[ingredient.index].title;
  		if(count > 1){
  			list += '(x' + count +')';
  		}
  		list += ', ';
  	}
  	list = list.substr(0, list.length - 2);
  	return list;
  },
  getProductTitle: function(parent, id){
    var result = ' ';
  	switch(parent.productType){
  		case 'pizza':
  			result += 'Пицца';
  			break;
  		case 'pita':
  			result += 'Лаваш';
  			break;
  		case 'salad':
  			result += 'Салат';
  			break;
      case 'drink':
        result += parent.menuList[id].title;
        break;
      case 'fried':
        result += parent.menuList[id].title;
        break;
  	}
  	return result;
  },
  joinCartItemData: function(parent, id){
    var counter = document.getElementById('productCount'),
        type = parent.productType,
  	 		product;

  	if(type == 'drink' || type == 'fried'){
  		product = {
  			kcal: parent.menuList[id].kcal,
  			price: parent.menuList[id].price,
  			icon: parent.menuList[id].icon
  		};
  	} else {
  		product = this.calculateNumericalOptions(parent);
      product.consistsOf = this.generateReadyIngredientList(parent);
  	}
    if(type == 'pizza'){
      product.sauce = _this.sauce;
    }
  	product.title = this.getProductTitle(parent, id);
  	product.type = parent.productType;
  	product.count = +counter.value;
  	counter.value = 1;
  	product.size = BottomPanel.productSize + 'x' + BottomPanel.productSize;
  	this.productsList.push(product);

  	return product;
  },
  cartItemTemplate: function(index, reset, parent, id){
    var product, item = 'basket_item';

    if(index !== false){
      product = this.productsList[index];
    } else {
      product = this.joinCartItemData(parent, id);
    }

  	this.generalCost += (index === false) ? product.price * product.count : 0;
  	this.generalKcal += (index === false) ? product.kcal * product.count : 0;
  	if(parent.currentTab == 3){
  		var container = document.createElement('li'),
  				imgBox = document.createElement('div'),
  				img = document.createElement('img'),
  				infoBox = document.createElement('div'),
  				titleBox = document.createElement('div'),
  				consistsOfBox = document.createElement('div'),
  				sizeBox = document.createElement('div'),
  				numberBox = document.createElement('div')
  				footerBox = document.createElement('div'),
  				kcalBox = document.createElement('div'),
  				priceBox = document.createElement('div'),
  				removeBtn = document.createElement('div'),
          noteField = document.createElement('textarea');

  		if(product.type == 'drink' || product.type == 'fried'){
  			img.src = product.icon;
  		} else {
  			img.src = 'img/left_block/' + product.type + '.png';
  		}
  		imgBox.className = item + '_img';
  		imgBox.appendChild(img);
  		container.appendChild(imgBox);

  		infoBox.className = item;
  		container.appendChild(infoBox);

  		titleBox.className = item + '_title';
  		titleBox.innerHTML = product.title;

  		if(product.type != 'drink' && product.type != 'fried'){
  			consistsOfBox.className = item + '_from_menu';
  			consistsOfBox.innerHTML = '<span>Ингредиенты: </span><b>' + product.consistsOf + '</b>';
  		}
  		if(product.type != 'drink' && product.type != 'fried'){
  			sizeBox.className = item + '_size';
  			sizeBox.innerHTML = '<span>Размер: </span><b>' + product.size + '</b>';
  		}

  		numberBox.className = 'number_of_items';
  		numberBox.innerHTML = '<span>Количество: </span><b>' + product.count + '</b>';

  		footerBox.className = item + '_footer';
  		kcalBox.className = item + '_Kkal';
  		kcalBox.innerHTML = '<b>' + product.kcal + '</b> Ккал';

  		priceBox.className = item + '_price';
  		priceBox.innerHTML = '<b>' + product.price + '</b>$';

  		footerBox.appendChild(kcalBox);
  		footerBox.appendChild(priceBox);

  		infoBox.appendChild(titleBox);
  		infoBox.appendChild(consistsOfBox);
  		infoBox.appendChild(numberBox);

      if(product.type != 'drink' && product.type != 'fried'){
        noteField.setAttribute('type', 'text');
        noteField.className = 'basket_note';
        noteField.setAttribute('placeholder', 'Добавить примечание...');
        noteField.setAttribute('rows', 3);
        noteField.setAttribute('maxlength', 180);
        noteField.setAttribute('data-field-id', reset ? this.cartItemsNumber - 1 : index);
        infoBox.appendChild(sizeBox);
        container.appendChild(noteField);
      }
  		container.appendChild(footerBox);

  		removeBtn.className = 'delete_basket_item';
  		removeBtn.innerHTML = 'X';
  		removeBtn.setAttribute('data-remove-cart-item', reset ? this.cartItemsNumber - 1 : index);
  		container.appendChild(removeBtn);
  		document.getElementById('cartContainer').appendChild(container);
  	}
  	if(reset){
  		this.cartItemsNumber++;
  	}
  }
};

var BottomPanel = {
  productSize: 30,
  setProductSize: function(){
    var selectbox = document.getElementById('pizzaSize'),
  			value = selectbox.options[selectbox.selectedIndex].value,
  			params = ['Width', 'Height'];

  	for(var p = 0; p < 2; p++){
  		document.getElementById('workspace' + params[p]).innerHTML = value;
      BottomPanel.productSize = value;
  	}
  },
  changeProductNumber: function(event, target, attr){
    var value = target.getAttribute(attr),
  			field = document.getElementById('productCount');

  	if(value == '-'){
  		field.value -= (+field.value > 1) ? 1: 0;
  	} else {
  		field.value++;
  	}
  }
};

window.addEventListener('load', BottomPanel.setProductSize, false);
window.addEventListener('load', BottomPanel.getPizzeriaId, false);

EventHandler.on({
  action: 'click',
  attr: 'data-product-type'
}, function(event, target, attr){
  if(!_this.inProgress){
    Constructor.changeConstructor(event, target, attr);
  }
});

function placeIngredient(event, target, attr){
  if(!_this.inProgress){
		_this.inProgress = true;
		var start = {
			x: $(target).offset().left - $('#regionConstructor').offset().left,
			y: $(target).offset().top - $('#regionConstructor').offset().top
		};
		$('#regionConstructor').append('<div id="product_flight" style="width:' + $(target).width() + 'px;height:' + $(target).height() + 'px;top:' + start.y + 'px;left:' + start.x + 'px;background: url(' + $(target).children().attr('src') + '); background-size: cover;"></div>');

    $('#product_flight').animate({
				'left': '420px',
				'top': '90px'
		}, 750, function(){
			$(this).addClass('rezak');
			$('.knife').show();

			setTimeout(function(){
				$('#product_flight').css({
					'width': 0,
					'height': 0
				});
			}, 900);

			setTimeout(function(){
				$('#product_flight').remove();
			}, 1100);

			setTimeout(function() {
        var value = +target.getAttribute(attr);

        if(_this.pushItemToUsedIngredients(value)){
          _this.setIngredientLayer({
            ingredientIndex: value
          });
          isCartItem = true;
        }

				$('.knife').hide();
				_this.inProgress = false;
			}, 1300);
		});
  }
}

EventHandler.on({
  action: 'click',
  attr: 'data-add-ingr'
}, placeIngredient);

EventHandler.on({
  action: 'click',
  attr: 'data-list-add-ingr'
}, placeIngredient);

EventHandler.on({
	action: 'click',
	attr: 'data-product-id'
}, function(event, target, attr){
	_this.useProductTemplate.call(_this, event, target, attr);
});

EventHandler.on({
	action: 'keyup',
	attr: 'data-field-id'
}, function(event, target, attr){
  var value = +target.getAttribute(attr);

  Cart.productsList[value].note = target.value;
});

EventHandler.on({
  action: 'click',
  attr: 'data-list-del-ingr'
}, function(event, target, attr){
  _this.removeIngredientLayer.call(_this, event, target, attr);
});

EventHandler.on({
  action: 'mouseover',
  attr: 'data-ingr'
}, function(event, target, attr){
  _this.showIngredientPanel.call(_this, event, target, attr);
});

EventHandler.on({
  action: 'mouseout',
  attr: 'data-ingr'
}, function(event, target, attr){
  _this.hideIngredientPanel.call(_this);
});

EventHandler.on({
  action: 'mouseover',
  attr: 'data-ingr-panel'
}, function(){
  clearTimeout(_this.ingredientPanelTimeout);
});

EventHandler.on({
  action: 'mouseout',
  attr: 'data-ingr-panel'
}, function(event, target, attr){
  _this.hideIngredientPanel.call(_this);
});

EventHandler.on({
  action: 'click',
  attr: 'data-tabnav'
}, function(event, target, attr){
  Cart.cartIsCreated = false;
  _this.changeTab.call(_this, event, target, attr);
});

EventHandler.on({
  action: 'click',
  attr: 'data-filter-value'
}, function(event, target, attr){
  _this.showFilteredIngredients.call(_this, event, target, attr);
});

EventHandler.on({
  action: 'click',
  attr: 'data-product-filter-value'
}, function(event, target, attr){
  _this.showFilteredProducts.call(_this, event, target, attr);
});

EventHandler.on({
  action: 'click',
  attr: 'data-sauce'
}, function(event, target, attr){
  _this.setSauceLayer.call(_this, event, target, attr);
});

EventHandler.on({
  action: 'mousedown',
  attr: 'data-clear-workspace'
}, function(){
  _this.killConstructor.call(_this);
  _this.clearCache.call(_this);
  _this.initializeConstructor.call(_this);
});

EventHandler.on({
	action: 'click',
	attr: 'data-add-product'
}, function(event, target, attr){
  var value = +target.getAttribute(attr);

	if(isCartItem){
    if((_this.sauce != null) && _this.productType == 'pizza'){
      if(isEmptyObject(_this.usedIngredients)){
        setDiaogWindow({
          text: 'Выберите ингредиенты!'
        });
      } else {
        Cart.addToCart(false, true, _this, value);
      }
    } else {
      setDiaogWindow({
        text: 'Выберите соус!'
      });
    }
  } else {
    setDiaogWindow({
      text: 'Выберите продукт!'
    });
  }
});

EventHandler.on({
	action: 'mouseover',
	attr: 'data-product-id'
}, function(event, target, attr){
  _this.showDescriptionBlock.call(_this, event, target, attr);
});

EventHandler.on({
	action: 'mouseout',
	attr: 'data-product-id'
}, function(event, target, attr){
  _this.hideDescriptionBlock.call(_this, event, target, attr);
});

EventHandler.on({
	action: 'mouseover',
	attr: 'data-add-ingr'
}, function(event, target, attr){
  _this.showDescriptionBlock.call(_this, event, target, attr);
});

EventHandler.on({
	action: 'mouseout',
	attr: 'data-add-ingr'
}, function(event, target, attr){
  _this.hideDescriptionBlock.call(_this, event, target, attr);
});

EventHandler.on({
	action: 'mousedown',
	attr: 'data-remove-cart-item'
}, function(event, target, attr){
  Cart.removeCartItem.call(Cart, event, target, attr);
});

EventHandler.on({
	action: 'change',
	attr: 'data-pizza-size'
}, BottomPanel.setProductSize);

EventHandler.on({
	action: 'click',
	attr: 'data-change-number'
}, BottomPanel.changeProductNumber);

EventHandler.on({
	action: 'mousedown',
	attr: 'data-change-institution'
}, function(){
  var SI_wrapper = document.getElementById('selectInstitution'),
      SI_container = document.getElementById('SI_container');

  document.getElementById('SI_tip').style.display = 'inline';
  document.getElementById('SI_map').style.display = 'none';
  SI_wrapper.style.display = SI_container.style.display = 'block';
  document.querySelector('body').style.overflowY = 'hidden';
});

EventHandler.on({
  action: 'click',
  attr: 'data-undo'
}, function(event, target, attr){
  switch(target.getAttribute(attr)){
    case '-':
      _this.moveBack();
      break;
    case '+':
      _this.moveForward();
      break;
  }
});

window.addEventListener('load', function(){
  var makeOrderBox = document.getElementById('makeOrderWrapper'),
      makeOrderBg = document.getElementById('popups_bg')
      MO_container = document.getElementById('makeOrderContainer');

  var MO_fields = {
    name: document.getElementById('MO_name'),
    phone: document.getElementById('MO_phone'),
    address: document.getElementById('MO_address'),
    code: document.getElementById('MO_code')
  };

  SimpleScrollbar.initAll();

  function MO_resetFields(){
    for(key in MO_fields){
      MO_fields[key].value = '';
    }
  };

  function hideDialogWindow(parent, child, success, fail){
    var body = document.querySelector('body'),
        target = this;

    while(target != document){
      if(document.getElementById(parent).style.display != 'none'){
        if(!target || !target.hasOwnProperty('id')){
          body.style.overflowY = 'auto';
          return;
        }
        if(target.id == parent){
          if(!fail){
            body.style.overflowY = 'hidden';
            success();
          } else {
            body.style.overflowY = 'auto';
          }
          return;
        }
        if(target.id == child){
          body.style.overflowY = 'auto';
          return;
        }
        target = target.parentNode;
      } else {
        body.style.overflowY = 'auto';
        return;
      }
    }
  }

  document.addEventListener('click', function(event){
    var target = event.target;

    hideDialogWindow.call(target, 'makeOrderWrapper', 'makeOrderContainer', function(){
      makeOrderBox.style.display = 'none';
      MO_container.style.display = 'none';
      makeOrderBg.style.display = 'none';
      removeClass(MO_container, 'continue');
      MO_resetFields();
    });
  }, false);

  document.addEventListener('click', function(event){
    var target = event.target;

    hideDialogWindow.call(target, 'selectInstitution', 'SI_container', function(){
      var SI_wrapper = document.getElementById('selectInstitution');

      SI_wrapper.style.display = 'none';
    }, onStartConstructor ? true : false);
  }, false);

  EventHandler.on({
  	action: 'click',
  	attr: 'data-make-order'
  }, function(){
    if(Cart.productsList.length !== 0){
      makeOrderBox.style.display = 'block';
      MO_container.style.display = 'block';
      makeOrderBg.style.display = 'block';
    } else {
      setDiaogWindow({
        text: 'Добавьте продукт в корзину!'
      });
    }
  });

  EventHandler.on({
  	action: 'click',
  	attr: 'data-mo-continue'
  }, function(){
    if(MO_fields.name.value.replace(/(^\s*)|(\s*)$/g, '') !== '' &&
      MO_fields.phone.value.replace(/(^\s*)|(\s*)$/g, '') !== '' &&
      MO_fields.address.value.replace(/(^\s*)|(\s*)$/g, '') !== ''
    ){
      var orderData = {
        pizzeriaId: BottomPanel.pizzeriaIdValue,
        name: MO_fields.name.value,
        phone: MO_fields.phone.value,
        address: MO_fields.address.value,
        list: Cart.productsList
      };

      Ajax.request({
        url: 'sendOrder.php',
        send: orderData,
        method: 'POST'
      }, function(){
        var success = JSON.parse(this).success;

        if(success){
          addClass(document.getElementById('makeOrderContainer'), 'continue');
        } else {
          MO_resetFields();
          setDiaogWindow({
            text: 'Некорректные данные!'
          });
        }
      });
    } else {
      setDiaogWindow({
        text: 'Заполните все поля!'
      });
    }
  });

  EventHandler.on({
  	action: 'click',
  	attr: 'data-mo-send-cart'
  }, function(){
    var MO_code = MO_fields.code.value.replace(/(^\s*)|(\s*)$/g, '');
    if(MO_code !== '' && MO_code.length === 6){
      if(MO_code.length === 6){
        Ajax.request({
          url: 'sendCode.php',
          send: {
            code: MO_code
          }
        }, function(){
          var success = JSON.parse(this).success;

          if(success){
            makeOrderBox.style.display = 'none';
            removeClass(MO_container, 'continue');
            removeElement(document.getElementById('cartContainer'));
            MO_resetFields();
            Cart.productsList = [];
            Cart.cartIsCreated = false;
            Cart.cartItemsNumber = 0;
            Cart.generalCost = 0;
            Cart.generalKcal = 0;
            Cart.setGeneralCartValues();
          } else {
            MO_resetFields();
            setDiaogWindow({
              text: 'Неверный код!'
            });
          }
        });
      } else {
        setDiaogWindow({
          text: 'Неправильный код!'
        });
      }
    } else {
      setDiaogWindow({
        text: 'Введите код подтверждения!'
      });
    }
  });
}, false);

function setDiaogWindow(options){
  if(!isEmptyObject(dialogWindowTimeout)){
    clearTimeout(dialogWindowTimeout.animation);
    clearTimeout(dialogWindowTimeout.display);
  }

  var warning = document.getElementById('warningDialogWindow'),
      delay = options.delay || 3000;

  warning.innerHTML = options.text;
  warning.style.display = 'inline-block';
  warning.style.opacity = 1;
  warning.className = 'show';

  dialogWindowTimeout.animation = setTimeout(function(){
    warning.className = 'hide';
    warning.style.opacity = 0;
  }, delay - 500);

  dialogWindowTimeout.display = setTimeout(function(){
    warning.style.display = 'none';
  }, delay);
};

EventHandler.on({
  action: 'click',
  attr: 'data-institution-id'
}, function(event, target, attr){
  var id = +target.getAttribute(attr);

  document.getElementById('SI_map').style.display = 'block';
  document.getElementById('SI_tip').style.display = 'none';
  SelectInstitution.setHtmlInfo(id);
});

EventHandler.on({
  action: 'click',
  attr: 'data-set-institution'
}, function(){
  if(institutionID !== null){
    if(onStartConstructor){
      Constructor.onLoadConstructor();
      onStartConstructor = false;
    } else {
      Constructor.changeConstructor(true);
    }
    localStorage.clear();
    sessionStorage.clear();
    document.getElementById('selectInstitution').style.display = 'none';
    document.getElementById('institutionInfo').innerHTML = '';
    document.querySelector('body').style.overflowY = 'auto';
  } else {
    setDiaogWindow({
      text: 'Выберите заведение из списка!'
    });
  }
});

var SelectInstitution = {
  setHtmlInfo: function(id){
    Ajax.request({
      url: 'json/test.json',
      send: {
        id: id
      },
      method: 'POST'
    }, function(){
      var data = JSON.parse(this);

      institutionID = id;
      document.getElementById('institutionInfo').innerHTML = data[id].html;
    });
  }
};
