RPGJS.Scene.New({
	name: "Scene_Map",
	ready: function(stage, el, params) {
		var self = this;
		this.stage = stage;
		global.game_map.load(params.map_id, function(data) {
			self.loadMaterials(data);
		}, this);
	},
	loadMaterials: function(data, callback) {
	
		var images = [], self = this;
		images.push({tileset: RPGJS_Core.Path.get("tilesets", data.graphics.tileset)});
		images.push(RPGJS_Core.Path.get("characters", data.player.graphic, true));
		images.push({window: RPGJS_Core.Path.get("windowskins", "window")});
	
		data.autotiles_img = [];
		
		if (data.graphics.autotiles) {
			CE.each(data.graphics.autotiles, function(i, val) {
				var obj = RPGJS_Core.Path.get("autotiles", val, true);
				images.push(obj);
				for (var key in obj) {
					data.autotiles_img.push(key);
					break;
				}
			});
		}
		
		if (data.events) {
			CE.each(data.events, function(i, val) {
				if (val.graphic) {
					images.push(RPGJS_Core.Path.get("characters", val.graphic, true));
				}
			});
		}
		
		images.concat(RPGJS_Core.Plugin.call("Sprite", "mapLoadImages", [images, this]));
		
		RPGJS.Materials.load("images", images, function(img) {
			// -- Empty
		}, function() {
			self.load(data);
			if (callback) callback();
		});
	},
	keysAssign: function() {
		var self = this;
		RPGJS.Input.reset();
		
		CanvasEngine.each(["Up", "Right", "Left", "Bottom"], function(i, val) {

			RPGJS.Input.press(Input[val], function() {
				self.spriteset.player.startMove();
			});
			RPGJS.Input.keyUp(Input[val], function() {
				if (!RPGJS.Input.isPressed([Input.Up, Input.Right, Input.Left, Input.Bottom])) {
					self.spriteset.player.stop();
				}
			});
		});
		
		RPGJS.Input.press([Input.Enter, Input.Space], function() {
			global.game_map.execEvent();
		});
		
		RPGJS.Input.press([Input.Esc], function() {
			self.pause(true);
			RPGJS_Core.scene.call("Scene_Menu", {
				overlay: true
			});
		});
	},
	load: function(data) {
		
		this.spriteset = Class.New("Spriteset_Map", [this, this.stage, data, {
			autotiles: data.autotiles_img
		}]);
		
		this.keysAssign();
		
		//if (params.onload) params.onload.call(this, data);

	},
	render: function(stage) {
	
		if (!this.spriteset) {
			return;
		}
	
		var input = {
			"left": [Input.Left, "x"],
			"right": [Input.Right, "x"],
			"bottom": [Input.Bottom, "y"],
			"up": [Input.Up, "y"]
		},
		sprite_player = this.spriteset.player;
		
		var press = 0;
		
		for (var key in input) {
			if (RPGJS.Input.isPressed(input[key][0])) {
				press++;
				if (press == 1) global.game_player.moveDir(key);
			}
		}
		
		this.spriteset.scrollingUpdate();
		this.updateEvents();

		stage.refresh();

	},
	
	animation: function(event_id, animation_id) {
		this.getSpriteset().getEvent(event_id).showAnimation(animation_id);
	},
	
	effect: function(name, params, finish) {
		this.getSpriteset().effect(name, params, finish);
	},
	
	pictures: function(method, params) {
		var s = this.getSpriteset();
		s[method + "Picture"].apply(s, params);
	},
	
	updateEvents: function() {
		global.game_map.updateEvents();
	},
	
	scrollMap: function(pos, finish) {
		this.getSpriteset().scrollMap(pos, finish);
	},
	
	getSpriteset: function() {
		return this.spriteset;
	},
	
	stopEvent: function(id) {
		this.getSpriteset().stopEvent(id);
	},
	
	moveEvent: function(id, value, dir) {
		this.getSpriteset().moveEvent(id, value, dir);
	},
	
	setEventPosition: function(id, x, y) {
		var spriteset = this.getSpriteset();
		if (spriteset) {
			this.getSpriteset().getEvent(id).setPosition(x, y);
		}
	},
	
	blink: function(event_id, duration, frequence, finish) {
		var event = this.getSpriteset().getEvent(event_id);
		if (event) {
			event = event.getSprite();
			RPGJS.Effect.new(this, event).blink(duration, frequence, finish);
		}
	},
	
	removeEvent: function(id) {
		this.getSpriteset().removeCharacter(id);
	},
	
	refreshEvent: function(id, data) {
		this.getSpriteset().refreshCharacter(id, data);
	},
	
	addEvent: function(data) {
		this.getSpriteset().addCharacter(data);
	}
});