class Game extends Phaser.Scene {
  constructor() {
    super('Game');
  }  
  
  // -------------------
  // create function
  // -------------------
  create() {
    // launches the hud
    this.scene.launch('HUD');
    this.ui = this.scene.get('HUD');

    // adds Tiled map to the scene and stores it in a variable
    this.map = this.add.tilemap('map');
    const mapWidth = this.map.widthInPixels;
    const mapHeight = this.map.heightInPixels;

    // creates the tileset used for the map and stores it in a variable
    const tiles_extruded = this.map.addTilesetImage('tileset-extruded', 'tileset-extruded', 18, 18);

    // layers of isometric map. terrain - trees, building bases - roofs, stuff
    this.layer1 = this.map.createLayer('terrain', tiles_extruded);
    this.objectLayer = this.map.getObjectLayer('trees');

    // camera controls
    const cursors = this.input.keyboard.createCursorKeys();

    this.cameras.main.setZoom(0.75);
    const cameraX = -(mapWidth / 2) + 32; // offset for tile width
    const cameraY = 0;
    const cameraWidth = -cameraX + (mapWidth / 2) + 32; // offset for tile width
    const cameraHeight = -cameraY + mapHeight + 64 + 100; // offset for hud and tile height
    this.cameras.main.setBounds(cameraX, cameraY, cameraWidth, cameraHeight, true);
    this.cameras.main.scrollY += -50; // scrolls camera p by half of hud offset
    this.input.mouse.disableContextMenu();

    // zoom controls
    this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
      if (deltaY > 0 && this.cameras.main.zoom <= 5) {this.cameras.main.zoom += 0.1;}
      if (deltaY < 0 && this.cameras.main.zoom >= 0.75) {this.cameras.main.zoom -= 0.1;}
      // console.log('zoom: ' + this.cameras.main.zoom);
    }, this)

    const controlConfig = {
      camera: this.cameras.main,
      left: cursors.left,
      right: cursors.right,
      up: cursors.up,
      down: cursors.down,
      acceleration: 0.4,
      drag: 0.0025,
      maxSpeed: 0.7
    };

    this.controls = new Phaser.Cameras.Controls.SmoothedKeyControl(controlConfig);

    // minimap 
    this.minimap = this.cameras.add(0, 350, 200, 150).setZoom(0.25).setName('mini');
    this.minimap.setBackgroundColor(0x111111);
    this.minimap.setBounds(cameraX, cameraY, cameraWidth, cameraHeight, true);
    // camera controls

    // variables and bools
    //

    // controls all debug stuff
    this.debugMode = true;
    this.debugCursorRect = this.add.rectangle(0, 0, 64, 16, 0xff00ff).setOrigin(0).setDepth(100);
    this.debugCursorText = this.add.text(0, 0, 'x: 0, y: 0', {font: '10px Arial', fill: '#fff'}).setDepth(100);

    // debug tiles tinted by update preview to show where top bottom and center of preview are
    this.debugPreviewStartTile;
    this.debugPreviewStartTile;
    this.debugPreviewStartTile;

    // tiles tinted by update preview
    this.tintedTile;
    this.tintedBuilding;

    // the building that will be placed if an empty tile is clicked
    this.building = "";
    // the building or tile that is currently selected
    this.selectedObj = "";
    // the direction that the building is facing if clicked
    // 0 - bottom right | 1 - top right | 2 - top left | 3 - bottom left
    this.direction = 0;
    this.Q = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    this.E = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // contains all objects on the object layer
    this.objects = this.add.group().setActive(true)
    // contains all currently active resource tiles
    this.resourceTiles = this.add.group().setActive(true);
    this.trees = this.map.createFromObjects('trees', {
      gid: 7,
      key: 'tree',
      // classType: Tree,
    });
    this.objects.addMultiple(this.trees);
    // contains all building objects currently active
    this.buildings = this.add.group().setActive(true);
    this.houses = [];
    this.farms = [];
    this.woodcutters = [];
    this.quarries = [];
    this.mines = [];
    this.bridges = [];
    this.walls = [];
    this.towers = [];

    // each building
    this.buildDim = {
      house: {w: 38, h: 44, bx: 34, by: 17},
      farm: {w: 64, h: 39, bx: 64, by: 33},
      woodcutter: {w: 32, h: 37, bx: 16, by: 16}, // not final
      quarry: {w: 32, h: 32, bx: 16, by: 16}, // not final
      mine: {w: 32, h: 32, bx: 16, by: 16}, // not final
      wall: {w: 16, h: 41, bx: 16, by: 9},
      tower: {w: 36, h: 89, bx: 32, by: 17},
      keep: {w: 64, h: 83, bx: 64, by: 33},
    };
    // dimensions of the building that the building preview image is currently displaying
    this.previewDim = this.buildDim.keep;
    console.log('this.previewDim: ', this.previewDim)
    

    this.buildingPreview = this.add.image(0, 0, 'keep',).setVisible(false).setAlpha(.5).setDepth(100);


    // debug tile tint
    this.debugTiles;

    // variables and bools
    //

    this.keepPlaced = false;
    this.keepDestroyed = false;
    this.cursorOverUI = false;
    
    // resources
    this.food = 0;
    this.stone = 0;
    this.wood = 0;
    this.iron = 0;
    this.gold = 0;

    this.people = this.add.group().setActive(true);
    
    this.employed = this.people.getChildren().filter(person => person.work !== 'unemployed');
    this.unemployed = this.people.getChildren().filter(person => person.work == 'unemployed');
    this.housed = this.people.getChildren().filter(person => person.home !== 'homeless');
    this.houseless = this.people.getChildren().filter(person => person.home == 'homeless');
    
    this.population = this.people.getLength();
    // resources

    // pointer up event listener logic
    this.clickEvent = (pointer, obj) => {
      const x = pointer.worldX;
      const y = pointer.worldY;
      // console.log('x: ' + x + '\ny: ' + y);
      const clickedObj = obj[0];
      const clickedTerrain = this.layer1.getIsoTileAtWorldXY(x, y + 8, false);
      const tiles = this.getTiles(x, y, this.previewDim.bx, this.previewDim.by)
      const overlapping = this.checkOverlap(this.buildings.getChildren(), tiles)

      if (clickedTerrain && this.debugMode) {
        clickedTerrain.tint = 0x00ff00
      }

      if (this.building != '' && this.building != 'delete' && !overlapping) {
        this.placeBuilding(x, y, this.building, this.direction, clickedTerrain);
      } else if (this.building == '' && clickedObj) {
        this.selectedObj = clickedObj;
        this.ui.popupHandler.infoPopup(clickedObj);
      } else if (this.building == 'delete' && clickedObj) {
        console.log('delete, click event')
        this.deleteBuilding(clickedObj);
      } /*else if (clickedObj) {
        this.ui.popupHandler.infoPopup(clickedObj);
        }*/
    }

    this.moveEvent = (pointer) => {
      const x = pointer.worldX;
      const y = pointer.worldY;

      this.cursorOverUI = false

      if (this.debugMode) {
        this.debugCursorRect.setPosition(x, y);
        this.debugCursorText.setPosition(x, y);
        // phaser does not like this code at all
        // if (this.debugTiles) {
        //   console.log('debug tiles in moveevent if')
        //   this.debugTiles.forEach(tile => {tile.tint = 0xffffff});
        //   let last
        //   [this.debugTiles, last] = this.getPreviewTiles(this.previewDim.w, this.previewDim.h, this.previewDim.bx, this.previewDim.by);
        //   this.debugTiles.forEach(tile => {tile.tint = 0x0ff00f});
        // } else {
        //   console.log('debug tiles in moveevent else')
        //   let last
        //   [this.debugTiles, last] = this.getPreviewTiles(this.previewDim.w, this.previewDim.h, this.previewDim.bx, this.previewDim.by);
        //   this.debugTiles.forEach(tile => {tile.tint = 0x0ff00f});
        // }
        let tile = this.layer1.getIsoTileAtWorldXY(x, y, false);
        this.debugCursorText.text = 'x: ' + Math.floor(x) + ', y: ' + Math.floor(y)
        if (tile) {
          this.debugCursorText.text += '\ntile x: ' + tile.x + ' tile y: ' + tile.y;
        }
      }
    }

    // pointer down event listener
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {this.building = '';}
    }, this);
    // pointer up event listener
    this.input.on('pointerup', this.clickEvent, this);
    // makes building preview invisible when pointer moves off screen or onto ui
    this.input.on('gameout', () => {this.cursorOverUI = true;}, this);
    this.input.on('pointermove', this.moveEvent, this);
  }
  // -------------------
  // create function end
  // -------------------
  
  // -------------------
  // update function
  // -------------------
  update(time, delta) {
    // camera controls
    this.controls.update(delta);

    this.updatePreview(this.input.activePointer);

    // resource updater
    this.population = this.people.getLength();
    this.employed = this.people.getChildren().filter(person => person.work !== 'unemployed');
    this.unemployed = this.people.getChildren().filter(person => person.work == 'unemployed');
    this.housed = this.people.getChildren().filter(person => person.home !== 'homeless');
    this.houseless = this.people.getChildren().filter(person => person.home == 'homeless');

    // checks if q has been pressed and changes this.direction and updates the preview image
    if (Phaser.Input.Keyboard.JustDown(this.Q)) {
      if (!this.building == '') {
        this.direction++
        if (this.direction > 3) {this.direction = 0;}
        console.log('new direction: ' + this.direction);
      }
    }
    // checks if e has been pressed and changes this.direction and updates the preview image
    if (Phaser.Input.Keyboard.JustDown(this.E)) {
      if (!this.building == '') {
        this.direction--
        if (this.direction < 0) {this.direction = 3;}
        console.log('new direction: ' + this.direction);
      }
    }

    // runs each building and persons update method
    this.buildings.getChildren().forEach(b => {
      b.update(time, delta);
    })
    this.people.getChildren().forEach(p => {
      p.update(time, delta);
    })

    // this.buildings.preUpdate(time, delta);
    // this.people.preUpdate(time, delta);

    // checks if game is over
    if (this.population <= 0 && this.keepPlaced) {
      this.endGame('people');
    } else if (this.keepDestroyed) {
      this.endGame('people');
    }
  }
  // -------------------
  // update function end
  // -------------------

  // -------------------
  // custom function
  // -------------------
  // creates the new building object and places the corresponding index on the tilemap
  placeBuilding(x, y, type, direction, tile) {
    let newBuilding;
    let lastTile;
    // this.add.image(tileCenter.x, tileCenter.y, 'texture').setOrigin(0.5).setDepth(100)
    
    // tile placement new <Building>(x, y, width, height - half of building height + 4 offset, direction)

    // get the tiles that are taken up by the previews base
    let previewTiles;
    let dims;
    
    // place the container at the middle of the tile and half way up from the tile using container height
    switch (type) {
      case 'house' :
        dims = this.buildDim.house;
        [previewTiles, lastTile] = this.getPreviewTiles(x, y, dims);
        // checks for resources
        if (this.wood >= 50) {
          this.wood -= 50;
          newBuilding = new House(this, lastTile.x, lastTile.y - (dims.h / 2), dims.w, dims.h, direction, previewTiles);
          this.adjustDepth(newBuilding);
        } else {console.log('not enough resources'); this.cantPlace();}
        
        break;
      case 'farm' : 
        dims = this.buildDim.farm;
        [previewTiles, lastTile] = this.getPreviewTiles(x, y, dims);
        // checks for resources
        if (this.stone >= 5 && this.wood >= 10) {
          this.stone -= 5;
          this.wood -= 10;
          newBuilding = new Farm(this, lastTile.x, lastTile.y - (dims.h / 2), dims.w, dims.h, direction, previewTiles);
          this.adjustDepth(newBuilding);
        } else {console.log('not enough resources'); this.cantPlace();}
        
        break;
      case 'woodcutter':
        dims = this.buildDim.woodcutter;
        [previewTiles, lastTile] = this.getPreviewTiles(x, y, dims);
        // checks for resources
        if (this.wood >= 25) {
          this.stone -= 5;
          this.wood -= 25;
          newBuilding = new Woodcutter(this, lastTile.x, lastTile.y - (dims.h / 2), dims.w, dims.h, direction, previewTiles);
          this.adjustDepth(newBuilding);
        } else {console.log('not enough resources'); this.cantPlace();}

        break;
        case 'quarry':
        dims = this.buildDim.quarry;
        [previewTiles, lastTile] = this.getPreviewTiles(x, y, dims);
        // checks for resources
        if (this.wood >= 25 && this.checkResource(previewTiles, 5)) {
          this.stone -= 5;
          this.wood -= 25;
          newBuilding = new Quarry(this, lastTile.x, lastTile.y - (dims.h / 2), dims.w, dims.h, direction, previewTiles);
          this.adjustDepth(newBuilding);
        } else {console.log('not enough resources'); this.cantPlace();}

        break;
        case 'mine':
        dims = this.buildDim.mine;
        [previewTiles, lastTile] = this.getPreviewTiles(x, y, dims);
        // checks for resources
        if (this.wood >= 25 && this.checkResource(previewTiles, 3)) {
          this.stone -= 5;
          this.wood -= 25;
          newBuilding = new Mine(this, lastTile.x, lastTile.y - (dims.h / 2), dims.w, dims.h, direction, previewTiles);
          this.adjustDepth(newBuilding);
        } else {console.log('not enough resources'); this.cantPlace();}

        break;
      case 'wall' :
        dims = this.buildDim.wall;
        [previewTiles, lastTile] = this.getPreviewTiles(x, y, dims);
        // checks for resources
        if (this.stone >= 50) {
          this.stone -= 50;
          newBuilding = new Wall(this, lastTile.x, lastTile.y - (dims.h / 2) + 8, dims.w, dims.h, direction, previewTiles);
          this.adjustDepth(newBuilding);
        } else {console.log('not enough resources'); this.cantPlace();}
        
        break;
      case 'tower' :
        dims = this.buildDim.tower;
        [previewTiles, lastTile] = this.getPreviewTiles(x, y, dims);
        // checks for resources
        if (this.stone >= 75 && this.wood >= 25) {
          this.stone -= 75;
          this.wood -= 25;
          newBuilding = new Tower(this, lastTile.x, lastTile.y - (dims.h / 2), dims.w, dims.h, direction, previewTiles);
          this.adjustDepth(newBuilding);
        } else {console.log('not enough resources'); this.cantPlace();}
        
        break;
      case 'keep':
        dims = this.buildDim.keep;
        [previewTiles, lastTile] = this.getPreviewTiles(x, y, dims);
        // checks if the keep has been placed yet
        if (!this.keepPlaced) {
          newBuilding = new Keep(this, lastTile.x, lastTile.y - (dims.h / 2), dims.w, dims.h, direction, previewTiles); // idk why this needs to be offset
          this.adjustDepth(newBuilding);
          
          
        } else {console.log('keep already placed'); this.cantPlace();}
        
        break;
    }
    if (newBuilding) {
      this.buildings.add(newBuilding);
      this.objects.add(newBuilding);
    }
  } // placeBuilding end
  
  // calls the deleted buildings delete function and removes it from the building and object arrays
  deleteBuilding(building) {
    if (building.type != 'keep') {
      building.delete();
      this.buildings.remove(building, true, true);
      this.objects.remove(building, true, true);
    }
  }
  // called when a building is placed to change the depth of every object
  adjustDepth(building) {
    this.objects.add(building);
    this.objects.getChildren().sort((a, b) => a.y - b.y)
    this.objects.getChildren().forEach((obj, index) => {
      obj.setDepth(index)
    })
    // console.log(this.objects)
  } // end of adustDepth(y)

  // updates this.buildingPreview. ensures that index is correct and position is correct and snapped to tiles if possible
  updatePreview(pointer) {
    let x = pointer.worldX;
    let y = pointer.worldY;
    
    // x and y snapped to the tilemap. is offset to the top left by 32
    const snappedCords = this.layer1.worldToTileXY(x, y, true);
    const snappedWorldCords = this.layer1.tileToWorldXY(snappedCords.x, snappedCords.y);
    // currentTile the pointer is over. used for delete
    let currentBuilding;
    let currentTile;
    let tileCenter;

    // get the tiles that are taken up by the previews base
    let previewTiles;
    let lastTile;

    // assigns the tile the pointer is over to currentTile if it exists
    if (this.layer1.getIsoTileAtWorldXY(x, y + 8, false)) {
      currentTile = this.layer1.getIsoTileAtWorldXY(x, y + 8, false);
      tileCenter = {x: currentTile.pixelX + 9, y: currentTile.pixelY + 4}
    } else {currentTile = null}

    if (this.tintedTile) {this.tintedTile.tint = 0xffffff; this.tintedTile = null}
    if (this.tintedBuilding) {this.tintedBuilding.image.clearTint(); this.tintedBuilding = null}

    this.buildings.getChildren().forEach(building => {
      if (building.getBounds().contains(x, y)) {
        currentBuilding = building;
      }
    })

    // sets the preview to visible if a building has been selected
    if (this.building != '' && !this.cursorOverUI && this.building != 'delete') {
      this.buildingPreview.setVisible(true);
    } else {this.buildingPreview.setVisible(false);}

    // sets the preview to the correct building
    switch (this.building) {
      case 'house':
        this.buildingPreview.setTexture(`house${this.direction}`);
        this.previewDim = this.buildDim.house; // must have a semicolon here or it will combine both lines
        // [previewTiles, lastTile] = this.getPreviewTiles(x, y, this.previewDim);
        if (this.debugMode) {this.debugPreviewOutline(x, y, this.previewDim.bx, this.previewDim.by);}
        break;
      case 'farm':
        this.buildingPreview.setTexture('farm0');
        this.previewDim = this.buildDim.farm;
        if (this.debugMode) {this.debugPreviewOutline(x, y, this.previewDim.bx, this.previewDim.by);}
        break;
      case 'woodcutter':
        this.buildingPreview.setTexture(`woodcutter${this.direction}`);
        this.previewDim = this.buildDim.woodcutter;
        if (this.debugMode) {this.debugPreviewOutline(x, y, this.previewDim.bx, this.previewDim.by);}
        break;
      case 'quarry':
        this.buildingPreview.setTexture(`quarry${this.direction}`);
        this.previewDim = this.buildDim.quarry;
        if (this.debugMode) {this.debugPreviewOutline(x, y, this.previewDim.bx, this.previewDim.by);}
        break;
      case 'mine':
        this.buildingPreview.setTexture(`mine${this.direction}`);
        this.previewDim = this.buildDim.mine;
        if (this.debugMode) {this.debugPreviewOutline(x, y, this.previewDim.bx, this.previewDim.by);}
        break;
      case 'wall':
        this.buildingPreview.setTexture('wall');
        this.previewDim = this.buildDim.wall;
        if (this.debugMode) {this.debugPreviewOutline(x, y, this.previewDim.bx, this.previewDim.by);}
        break;
      case 'tower':
        this.buildingPreview.setTexture('tower');
        this.previewDim = this.buildDim.tower;
        if (this.debugMode) {this.debugPreviewOutline(x, y, this.previewDim.bx, this.previewDim.by);}
        break;
      case 'keep': 
        this.buildingPreview.setTexture('keep');
        this.previewDim = this.buildDim.keep;
        if (this.debugMode) {this.debugPreviewOutline(x, y, this.previewDim.bx, this.previewDim.by);}
        break;
      case 'delete':
        if (currentTile && !currentBuilding) {
          currentTile.tint = 0xff0000;
          this.tintedTile = currentTile;
        } else if (currentBuilding) {
          currentBuilding.image.setTint(0xff0000);
          this.tintedBuilding = currentBuilding;
        }
        break;
      default:
        this.buildingPreview.setTexture(this.building);
    } // end of building switch
    // sets the position snapped to the tile or on the pointer
    if (this.buildingPreview._visible) {
      this.buildingPreview.setPosition(x, y);
      [previewTiles, lastTile] = this.getPreviewTiles(x, y, this.previewDim);
      
      if (lastTile.x && lastTile.y) {
        this.buildingPreview.setPosition(lastTile.x, lastTile.y - (this.previewDim.h / 2));
      }
    }
  } // updatePreview end

  cantPlace() {
    this.buildingPreview.setTint(0xff0000);
    this.timer = this.time.addEvent({
      delay: 100,
      callback: () => {this.buildingPreview.clearTint();},
      callbackScope: this,
      loop: false,
    });
  }

  // gets the tiles that the building will occupy and the lowest tile and returns it in an array. used in the placeBuidling function
  getPreviewTiles (x, y, dimensions) {
    // console.log('getPreviewTiles', 'x: ', x, '\ny: ', y, '\ndimensions: ', dimensions)
    let tiles = this.getTiles(x, y, dimensions.bx, dimensions.by);
    // define last tile if the mouse is fully on the map, make null if not
    let lastTile = tiles[tiles.length - 1] ? {x: tiles[tiles.length - 1].pixelX + 9, y: tiles[tiles.length - 1].pixelY + 8} : {x: null, y: null};
    // let lastTile = {x: tiles[tiles.length - 1].pixelX + 9, y: tiles[tiles.length - 1].pixelY + 8};
    // manually fix the wall placement -- places the blue tile tint in the correct place but the wall image is still wrong
    if (dimensions == this.buildDim.wall) {
      console.log('correcting wall placement')
      tiles = this.getTiles(x, y + 8, dimensions.bx, dimensions.by)
    }
    return [tiles, lastTile];
  }

  // gets the tiles that the building will cover
  getTiles(x, y, baseX, baseY) {
    // console.log('getTiles', 'x: ', x, '\ny: ', y, '\nbaseX: ', baseX, '\nbaseY: ', baseY);
    let baseXTile = Math.floor(baseX / 16);
    let baseYTile = Math.floor(baseY / 8);
    let centerTile = this.layer1.worldToTileXY(x, y, true);
    let startTile = {x: centerTile.x - Math.floor(baseXTile / 4), y: centerTile.y - Math.floor(baseYTile / 4)};
    
    let tiles = this.layer1.getTilesWithin(startTile.x, startTile.y, baseXTile, baseYTile);

    // changes the color of start, center, and end tiles when in debug mode
    if (this.debugMode) {
      if (this.debugPreviewStartTile && this.debugPreviewStartTile && this.debugPreviewStartTile) {
        this.debugPreviewStartTile.tint = 0xffffff;
        this.debugPreviewStartTile.tint = 0xffffff;
        this.debugPreviewStartTile.tint = 0xffffff;
      }
      if (tiles[tiles.length - 1]) {
        this.debugPreviewStartTile = this.layer1.getTileAt(startTile.x, startTile.y);
        this.debugPreviewCenterTile = this.layer1.getTileAt(centerTile.x, centerTile.y);
        this.debugPreviewEndTile = this.layer1.getTileAt(tiles[tiles.length - 1].x, tiles[tiles.length - 1].y);
        this.debugPreviewStartTile.tint = 0x00ffff;
        this.debugPreviewStartTile.tint = 0xffff00;
        this.debugPreviewStartTile.tint = 0xff00ff;
      }
    }
    
    return tiles;
  }

  // checks if a resource building is being placed on a tile with that resource
  checkResource(tiles, index) {
    let onResource = true;
    tiles.forEach(tile => {
      if (tile.index != index) {onResource = false}
    })
    return onResource;
  }

  // called when a building is being placed to see if it overlaps with anything
  checkOverlap(arr1, arr2) {
    let overlapping = false;
    // checks for other buildings
    arr1.forEach(building => {
      if (building.tiles.some(tile => arr2.includes(tile))) {
        console.log('building overlaps');
        overlapping = true;
      }
    })
    // checks for water
    arr2.forEach(tile => {
      if (tile.index == 6) {overlapping = true}
    })
    return overlapping;
  }

  // creates a line that shows where the building should be placed. does not snap to grid
  debugPreviewOutline(x, y, width, height) {

    this.clearGraphics();
    
    let centerDot = this.add.graphics();
    centerDot.fillStyle(0x0000ff, 1);
    centerDot.fillCircle(x, y, 1);

    let leftX = x - width / 2;
    let rightX = x + width / 2;
    let topY = y - height / 2;
    let bottomY = y + height / 2;

    let diamond = this.add.graphics();
    diamond.lineStyle(2, 0x0000ff, 1);
    diamond.beginPath();
    diamond.moveTo(x, topY);
    diamond.lineTo(rightX, y);
    diamond.lineTo(x, bottomY);
    diamond.lineTo(leftX, y);
    diamond.closePath();
    diamond.stroke();
  }

  // clears the debug building outline
  clearGraphics() {
      this.children.each(child => {
          if (child instanceof Phaser.GameObjects.Graphics) {
              child.clear();
              child.destroy();
          }
      });
  };

  // stops the hud and switches to the end game scene
  endGame(cause) {
    this.buildings.getChildren().forEach(building => {
      // building.delete();
    })
    this.scene.stop('HUD');
    this.scene.launch('End', {cause: cause})
  }
  // -------------------
  // custom function end
  // -------------------
}

// building info
// keep - free, only one placeable
// tower - 75 stone, 25 wood, 4 pop
// wall - 50 stone
// bridge - 50 stone, 25 wood
// house - 50 wood
// farm - 5 stone, 10 wood, 5 pop
// quarry - 50 wood, 4 pop
// mine - 50 wood, 25 stone, 4 pop
// woodcutter - 25 wood, 2 pop