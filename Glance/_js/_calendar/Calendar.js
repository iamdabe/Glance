(function (window)
{
	var _arrData;
	var _numData;
	var _arrItems;
	var _centerX;
	var _centerY;
	var _itemContainer;
	var _shapeContainer;
	var _arrShapes;
	var _numItems = 12;
	var _numShapes = 12;
	var _radius = 280;
	var _increase = -Math.PI * 2 / _numItems;
	var _angle = 0;
	var _diffCenter;
	
	var Calendar_p = Calendar.prototype = new createjs.Container();

	function Calendar(x, y, data)
	{
		_arrData = data.list;
		_centerX = x;
		_centerY = y;
		
		_diffCenter = _centerX-_radius*2;
		
		this.initialize();
	}

	Calendar_p.initialize = function ()
	{
		//console.log("Calendar::initialize");
		
		_numData = _arrData.length;
		_arrItems = new Array();
		_arrShapes = new Array();
		
		_itemContainer = new createjs.Container();
		
		_shapeContainer = new createjs.Container();
		_shapeContainer.regX = _centerX;
		_shapeContainer.regY = _centerY;
		_shapeContainer.x = _centerX;
		_shapeContainer.y = _centerY;
		
		Calendar.prototype.addChild(_shapeContainer);
		Calendar.prototype.addChild(_itemContainer);
		
		parseData();
		initItems();
		initShapes();
	}
	
	function parseData()
	{
		//console.log("Calendar::parseData");
		
		var arrNew = new Array();
		
		_numItems = 0//_arrData.length

		for (i = 0; i < _arrData.length; ++i)
		{
			//console.log(i+" - " + _arrData[i].name+" date: "+ _arrData[i].date);
			
			var item = _arrData[i];
			var isFine = checkDate(item.date);
			
			//console.log(item.name+" - "+isFine);
			
			if (isFine) {
			    arrNew.push(item);
			    _numItems++;
			}
		}

		_increase = -Math.PI * 2 / _numItems;

		_arrData = arrNew;
	}
	
	function checkDate(target)
	{	
		var date1 = new Date();
		var date2 = new Date(target);
		var timeDiff = date2.getTime() - date1.getTime();
		var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
		
		var val = diffDays < 0 ? false : true;
		
		return val;
	}
	
	function initItems()
	{
		var i = 0;
		var step = _angle;
		
		while(i < _numItems)
		{			
			var item = new createjs.Container();
			item.data = _arrData[i];
			item.pos = i;
			item.angle = step;
			
			//console.log(i)
			//console.log(item.data);
			//console.log(_arrData[i]);
			var date = new createjs.Container();
			var dayDiff = getDayDiff(item.data.date);
			var days = dayDiff > 1 ? " days" : " day";
			var txtDate = new createjs.Text(item.data.name+", "+item.data.location,"normal 24px Times New Roman","#FFF");
			var title = new createjs.Text(dayDiff+days,"normal 38px Times New Roman","#FFF");
			
			title.textAlign = txtDate.textAlign = "right";
			
			date.addChild(txtDate);
			item.addChild(title);
			item.addChild(date);
			
			var tw = title.getBounds().width;
			var dw = date.getBounds().width;
			
			item.tw = tw;
			item.dw = dw;
			
			var w = tw > dw ? tw : dw;
			
			title.y = -25;
			date.y = 25;
						
			var pX = (Math.cos(step)*_radius);
			var pY = (Math.sin(step)*_radius);
		
			_arrItems.push(item);
			
			item.title = title;
			item.titleW = title.getBounds().width;
			item.date = date;
			
			item.setTransform(_centerX, _centerY, 0, 0);
			
			if(_isRetina)
			{
				item.cache(-150, -150, 300, 300, 2);
			}else{
				item.cache(-w, -25, w, 100, 1);
			}
			
			item.tickEnabled = false;
			item.tickChildren = false;
			
			step+=_increase;
			i++;
		}
	}
	
	function initShapes()
	{
		_arrShapes = new Array();
		
		var i = 0;
		var step = _angle;
		var rad = 30;
		var shapeRadius = 250;
		
		while(i < _numShapes)
		{
			var shape = new createjs.Shape();
			
			var col = Math.floor(255-((i)*15))-5;
			var col2 = Math.floor(255-((i)*5))-5;
			
			var c1 = createjs.Graphics.getRGB(col-(i*10)-30, 0, col2-(i*30)-30);
			var c2 = createjs.Graphics.getRGB(0, col, col);

			shape.graphics.beginLinearGradientFill([c1,c2], [0, 1], 0, 0, 300, 150, 50, 200);
			
			var pX = shapeRadius;
			var pY = 0;
			
			var cx1 = getRadX(rad);
			var cy1 = getRadY(rad);
			
			var cx2 = getRadX(rad);
			var cy2 = getRadY(rad);
			
			if(i == 0)
			{
				cx1 = 200;
				cy1 = -15;
				
				cx1 = -10;
				cy2 = 15;
			}
			
			shape.graphics.moveTo(cx1, cy1).lineTo(cx2, cy2).lineTo(pX, pY).lineTo(cx1, cy1);
			shape.graphics.endFill();

			shape.x = _centerX;
			shape.y = _centerY;
			
			shape.cache(-rad, -rad, shapeRadius+rad+5, rad*2, 1);
			
			shape.scaleX = shape.scaleY = 0;
			shape.rotation = step * 57.295;
			
			_arrShapes.unshift(shape);
			
			_shapeContainer.addChildAt(shape, 0);
			
			step+=_increase;
			
			i++;
		}
		
		_shapeContainer.tickEnabled = false;
		_shapeContainer.tickChildren = false;
	}
	
	Calendar.prototype.showTime = function()
	{
		var now = new Date();
		var h = now.getHours();
		var m = now.getMinutes();
		var s = now.getSeconds();
		
		var degM = 2 * Math.PI * (m / 60) * 57.295;
		var degS = 2 * Math.PI * (s / 60) * 57.295;
		var degH = (2 * Math.PI * (h / 12) * 57.295)+degM/12;
		
		new TweenMax.to(_shapeContainer, 1,
		{
			shortRotation:{rotation:-90},
			ease:Power2.easeOut,
			overwrite:"all"
		});
		
		
		//Hours
		
		var sh = 0;
		
		while(sh < 3)
		{
			new TweenMax.to(_arrShapes[_numShapes-sh-1], 1,
			{
				shortRotation:{rotation:degH},
				ease:Power2.easeOut,
				scaleY:0.66,
				scaleX:0.66,
				overwrite:"all"
			});
			
			sh++;
		}
		
		//Minutes
		
		var sm = 3;
		
		while(sm < 6)
		{
			new TweenMax.to(_arrShapes[_numShapes-sm-1], 1,
			{
			shortRotation:{rotation:degM},
			scaleY:1,
			scaleX:1,
			ease:Power2.easeOut,
			overwrite:"all"
			});
			
			sm++;
		}
		
		//Seconds
		
		var ss = 6;
		
		while(ss < _numShapes)
		{
			new TweenMax.to(_arrShapes[_numShapes-ss-1], 1,
			{
			shortRotation:{rotation:degS},
			ease:Power2.easeOut,
			scaleY:.1,
			scaleX:1,
			overwrite:"all"
			});
			
			ss++;
		}
	}
	
	Calendar.prototype.updateTime = function()
	{
		var now = new Date();
		var h = now.getHours();
		var m = now.getMinutes();
		var s = now.getSeconds();
		
		var degM = 2 * Math.PI * (m / 60) * 57.295;
		var degS = 2 * Math.PI * (s / 60) * 57.295;
		var degH = (2 * Math.PI * (h / 12) * 57.295)+degM/12;
		
		_shapeContainer.rotation = -90;
		
		//Hours
		
		var sh = 0;
		
		while(sh < 3)
		{
			var s = _arrShapes[_numShapes-sh-1];
			s.rotation = degH;
			s.scaleX = s.scaleY = 0.66;
			
			sh++;
		}
		
		//Minutes
		
		var sm = 3;
		
		while(sm < 6)
		{
			var s = _arrShapes[_numShapes-sm-1];
			s.rotation = degM;
			s.scaleX = s.scaleY = 1;
			
			sm++;
		}
		
		//Seconds
		
		var ss = 6;
		
		while(ss < _numShapes)
		{
			var s = _arrShapes[_numShapes-ss-1];
			s.rotation = degS;
			s.scaleX = 1;
			s.scaleY = 0.1;
			
			ss++;
		}
	}
	
	Calendar.prototype.onDragStart = function(deg, reset)
	{
		var deg = 360-deg;
		_angle = deg * -(Math.PI/180);
		
		//console.log("onDragMove > "+reset);
		
		var i = 0;
		var step = _angle;
		
		var f = 1/12;
		var	scalShape = .66;
		
		while(i < _numItems)
		{
			var item = _arrItems[i];
			item.angle = step;
			
			var sh = _arrShapes[_numItems-i-1];
			var pX = _centerX+(Math.cos(step)*_radius);
			var pY = _centerY+(Math.sin(step)*_radius);
			var v = ((pX - _diffCenter)/380)-2;
			
			if(v < 0) v= 0;
			
			var scal = v*3.5;
			if(pY > _centerY+50) scal = 0;

			//console.log(step + ' ' + pX + ' ' + _centerX);

			item.visible = pX < _centerX && !reset ? false : true;
			if(reset && i==1) item.visible = false; 
			
			new TweenMax.to(item, 1,
			{
				x:pX,
				y:pY,
				scaleX:scal,
				scaleY:scal,
				ease:Power2.easeOut,
				overwrite:"all"
			});
			
			new TweenMax.to(_arrShapes[i], 0.66,
			{
				shortRotation:{rotation:(i+1)*30},
				scaleX:scalShape,
				scaleY:scalShape,
				ease:Power2.easeOut,
				overwrite:"all"
			});
			
			step+=_increase;
			
			i++;
		}
		
		new TweenMax.to(_shapeContainer, 1,
		{
			shortRotation:{rotation:-deg},
			ease:Power2.easeOut,
			overwrite:"all"
		});
	}
	
	Calendar.prototype.onDragMove = function(deg, reset)
	{
		var deg = 360-deg;
		_angle = deg * -(Math.PI/180);
		
		
		var i = 0;
		var step = _angle;
		
		while(i < _numItems)
		{
			var item = _arrItems[i];
			item.angle = step;
			
			var sh = _arrShapes[_numItems-i-1];
			var pX = _centerX+(Math.cos(step)*_radius);
			var pY = _centerY+(Math.sin(step)*_radius);
			var v = ((pX - _diffCenter)/380)-2;
			
			if(v < 0) v= 0;
			
			var scal = v*3.5;
			if(pY > _centerY+50) scal = 0;
			
			item.visible = pX < _centerX && !reset ? false : true;
			if(reset && i==1) item.visible = false; 
			
			new TweenMax.to(item, 1,
			{
				x:pX,
				y:pY,
				scaleX:scal,
				scaleY:scal,
				ease:Power2.easeOut,
				overwrite:"all"
			});
			
			step+=_increase;
			
			i++;
		}
		
		new TweenMax.to(_shapeContainer, 1,
		{
			shortRotation:{rotation:-deg},
			ease:Power2.easeOut,
			overwrite:"all"
		});
	}
	
	Calendar.prototype.onDragEnd = function(deg)
	{	
		var deg = 360-deg;
		_angle = deg * -(Math.PI/180);
		
		var i = 0;
		var step = _angle;
		
		while(i < _numItems)
		{
			var item = _arrItems[i];
			var sh = _arrShapes[_numItems-i-1];
			
			item.angle = step;
			var pX = _centerX+(Math.cos(step)*_radius);
			var pY = _centerY+(Math.sin(step)*_radius);
			var v = ((pX - _diffCenter)/380)-2;
			
			if(v < 0) v= 0;
			var scal = v*3;
			
			if(pY > _centerY+50) scal = 0;
			
			item.visible = pX < _centerX ? false : true;
			
			TweenMax.to(item, 1, 
			{
				x: pX,
				y: pY,
				scaleX:scal,
				scaleY:scal,
				ease:Power2.easeOut,
				overwrite:"all"
			});
						
			step+=_increase;
			
			i++;
		}
		
		new TweenMax.to(_shapeContainer, 1,
		{
			shortRotation:{rotation:-deg},
			ease:Power2.easeOut,
			overwrite:"all"
		});
	}
	
	function showItems()
	{
		var i = 0;
		var step = _angle;
		
		while(i < _numItems)
		{
		    var item = _arrItems[i];
			var pos = item.pos;
			var pX = _centerX+(Math.cos(step)*_radius);
			var pY = _centerY+(Math.sin(step)*_radius);
			var v = ((pX - _diffCenter)/380)-2;
			
			if(v < 0) v= 0;
			var scal = v*3;
			
			if(pY > _centerY+50) scal = 0;
			
			console.log(_angle = ' '+ Math.cos(step));

			item.visible = pX < _centerX ? false : true;
			
			new TweenMax.to(item, .88+(i*.11), {
				x: pX,
				y: pY,
				scaleX:scal,
				scaleY:scal,
				ease:Power2.easeOut,
				overwrite:"all"
			});
			
			_itemContainer.addChild(item);
			
			step+=_increase;
			i++;
			
		}
		
	}
	
	function showShapes()
	{
		var i = 0;
		
		while(i < _numShapes)
		{
			var shape = _arrShapes[i];
			
			var f = 1/12;
			var scal = .66;//(i+f)*f;
			
			new TweenMax.to(shape, 0.66,
			{
				scaleX:scal,
				scaleY:scal,
				ease:Power2.easeOut,
				overwrite:"all",
				delay:(i+1)*0.1
			});
			
			i++;
		}
	}
	
	function resetShapes()
	{
		var i = 0;
		var num = _arrShapes.length;
		
		while(i < num)
		{
			var shape = _arrShapes[i];
			
			new TweenMax.to(shape, 0.44+(i*0.1),
			{
				scaleX:0,
				scaleY:0,
				rotation:90,
				ease:Power2.easeOut,
				overwrite:"all"
			});
			
			i++;
		}
		
		initShapes();
		showShapes();
	}
	
	function getRadX(rad)
	{		
		var angle = Math.random()*Math.PI*2;
		return Math.cos(angle)*rad;
	}
	
	function getRadY(rad)
	{		
		var angle = Math.random()*Math.PI*2;
		return Math.sin(angle)*rad;
	}
	
	function getDayDiff(target)
	{	
	    var date1 = new Date();
		var date2 = new Date(target);


		var timeDiff = date2.getTime() - date1.getTime();
		var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
		
		return diffDays;
	}

	Calendar.prototype.show = function ()
	{
		//console.log("Calendar::show");
		showItems();
		setTimeout(showShapes, 250);
	}

	window.Calendar = Calendar;

}(window));