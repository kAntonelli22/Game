// -------------------
// menu scene
// -------------------
class Boot extends Phaser.Scene {
  constructor() {
      super('Boot');
  }
  preload() {
    //https://www.deviantart.com/piloufac/art/medieval-landscape-946110573
    this.load.image('background', 'assets/background.jpg');
    this.load.image('texture', 'assets/images/texture.png');
    // make sure to change tileset path and name if changing the tileset
    this.load.image('tileset-extruded', 'assets/tiles/tileset-extruded.png');
    this.load.tilemapTiledJSON('map', 'assets/map.json');
    // loads html ui
    this.load.html('menu', 'assets/html/menu.html');
    this.load.html('topLeft', 'assets/html/topLeft.html');
    this.load.html('topRight', 'assets/html/topRight.html');
    this.load.html('dashboard', 'assets/html/dashboard.html');
    this.load.html('pause', 'assets/html/pause.html');
    this.load.html('end', 'assets/html/end.html');
    this.load.html('catalogButtons', 'assets/html/catalogButtons.html');
    this.load.html('catalogPopup', 'assets/html/catalogPopup.html');
    this.load.html('infoPopup', 'assets/html/infoPopup.html');
    this.load.html('eventPopup', 'assets/html/eventPopup.html');
    this.load.html('foodWarning', 'assets/html/foodWarning.html');
    this.load.html('homelessWarning', 'assets/html/homelessWarning.html');

    // tile images
    //
    // civilian
    this.load.image('house0', 'assets/tiles/house0.png');
    this.load.image('house1', 'assets/tiles/house1.png');
    this.load.image('house2', 'assets/tiles/house2.png');
    this.load.image('house3', 'assets/tiles/house3.png');
    this.load.image('houseConstruction', 'assets/tiles/house_construction.png');
    this.load.image('bridge0', 'assets/tiles/bridge0.png');
    this.load.image('bridge1', 'assets/tiles/bridge1.png');
    // industry
    this.load.image('farm0', 'assets/tiles/farm0.png');
    this.load.image('farm1', 'assets/tiles/farm1.png');
    this.load.image('farm2', 'assets/tiles/farm2.png');
    this.load.image('quarry0', 'assets/tiles/quarry_placeholder.png');
    this.load.image('quarry1', 'assets/tiles/quarry_placeholder.png');
    this.load.image('quarry2', 'assets/tiles/quarry_placeholder.png');
    this.load.image('quarry3', 'assets/tiles/quarry_placeholder.png');
    this.load.image('mine0', 'assets/tiles/mine_placeholder.png');
    this.load.image('mine1', 'assets/tiles/mine_placeholder.png');
    this.load.image('mine2', 'assets/tiles/mine_placeholder.png');
    this.load.image('mine3', 'assets/tiles/mine_placeholder.png');
    this.load.image('woodcutter0', 'assets/tiles/hut0.png');
    this.load.image('woodcutter1', 'assets/tiles/hut1.png');
    this.load.image('woodcutter2', 'assets/tiles/hut2.png');
    this.load.image('woodcutter3', 'assets/tiles/hut3.png');
    // military
    this.load.image('wall', 'assets/tiles/wall.png');
    this.load.image('tower', 'assets/tiles/tower.png');
    this.load.image('keep', 'assets/tiles/keep.png');
    // other
    this.load.image('tree', 'assets/images/tree.png');
    this.load.image('person', 'assets/images/person_placeholder.png');

    // ui images
    this.load.image('gold', 'assets/images/gold.png');
    this.load.image('wood', 'assets/images/wood.png');
    this.load.image('stone', 'assets/images/stone.png');
    this.load.image('person', 'assets/images/person.png');
    this.load.image('food', 'assets/images/food.png');
    // animals - https://scrabling.itch.io/pixel-isometric-tiles
  }
  create() {
    this.scene.start('Menu')
  }
}
  

// -------------------
// menu scene
// -------------------
class Menu extends Phaser.Scene {
  constructor() {
    super('Menu');
  }
  create() {

    const menu = this.add.dom(0, 0).createFromCache('menu').setOrigin(0);

    const start = menu.getChildByID('start');

    start.addEventListener('pointerup' , () => {
      this.scene.start('Game');
    }, this)
  }
}
// -------------------
// menu scene
// -------------------

// -------------------
// hud scene
// -------------------

class HUD extends Phaser.Scene {
  constructor() {
    super('HUD');
  }
  create() {

    // game scene
    this.gameScene = this.scene.get('Game');

    const catalogButtons = this.add.dom(200, 350).createFromCache('catalogButtons').setOrigin(0);
    this.popupHandler = new popupContainer(this, 0, 0);
    const mil = catalogButtons.getChildByID('mil');
    const ind = catalogButtons.getChildByID('ind');
    const civ = catalogButtons.getChildByID('civ');
    const del = catalogButtons.getChildByID('delete');
    this.currentTab = 'none';

    // delete event listener for buildings
    del.addEventListener('pointerup' , () => {this.scene.get('Game').building = 'delete';}, this)
    // event listeners for tab switching. either pulls up catalog with container, switches the tab, or destroys the catalog through the container
    mil.addEventListener('pointerup' , () => {
      if (this.currentTab.id != 'milTab' && !this.popupHandler.popups.find(obj => obj.type == 'catalog')) {
        this.popupHandler.catalogPopup('milTab');
      } else if (this.currentTab.id != 'milTab') {
        this.switchTab(this.popupHandler.milTab, this.currentTab);
      } else {this.popupHandler.destroyPopup('catalog');}
    }, this)
    
    ind.addEventListener('pointerup' , () => {
      if (this.currentTab.id != 'indTab' && !this.popupHandler.popups.find(obj => obj.type == 'catalog')) {
        this.popupHandler.catalogPopup('indTab');
      } else if (this.currentTab.id != 'indTab') {
        this.switchTab(this.popupHandler.indTab, this.currentTab);
      } else {this.popupHandler.destroyPopup('catalog');}
    }, this)
    
    civ.addEventListener('pointerup' , () => {
      if (this.currentTab.id != 'civTab' && !this.popupHandler.popups.find(obj => obj.type == 'catalog')) {
        this.popupHandler.catalogPopup('civTab');
      } else if (this.currentTab.id != 'civTab') {
        this.switchTab(this.popupHandler.civTab, this.currentTab);
      } else {this.popupHandler.destroyPopup('catalog');}
    }, this)

    const topRight = this.add.dom(800, 0).createFromCache('topRight').setOrigin(1, 0);

    const gold = topRight.getChildByID('gold');
    const wood = topRight.getChildByID('wood');
    const stone = topRight.getChildByID('stone');
    const iron = topRight.getChildByID('iron');
    const population = topRight.getChildByID('population');
    const food = topRight.getChildByID('food');

    const topLeft = this.add.dom(0, 0).createFromCache('topLeft').setOrigin(0)
    const menubar = topLeft.getChildByID('topLeft');
    menubar.addEventListener('pointerup' , () => {
      this.scene.pause('Game');
      this.scene.start('Pause');
    }, this)
    
  }
  update () {
    gold.textContent = this.gameScene.gold;
    wood.textContent = this.gameScene.wood;
    stone.textContent = this.gameScene.stone;
    iron.textContent = this.gameScene.iron;
    population.textContent = this.gameScene.population;
    food.textContent = this.gameScene.food;
  }
  // switches what tab is being displayed
  switchTab(tab, current) {
    if (this.currentTab == 'none') {
      tab.style.display = 'flex';
    } else {
      current.style.display = 'none';
      tab.style.display = 'flex';
    }
    this.currentTab = tab;
    console.log('switching tabs');
  }
  changeResource(resource, amount, plus) {
    if (plus) {
      // tween the number green and then change it by amount
    }
  }
}

class Pause extends Phaser.Scene {
  constructor() {
    super('Pause');
  }
  create() {
    this.scene.pause('Game');
    
    const pause = this.add.dom(0, 0).createFromCache('pause').setOrigin(0);
    const resume = pause.getChildByID('resume');
    const returnMenu = pause.getChildByID('return');
    const settings = pause.getChildByID('settings');

    resume.addEventListener('pointerup' , () => {this.scene.start('Game');}, this)

    returnMenu.addEventListener('pointerup' , () => {
      this.scene.stop('Game');
      this.scene.start('Menu');
    }, this)
  }
}

class End extends Phaser.Scene {
  constructor() {
    super('End');
  }
  init(data) {
    this.data = data;
  }
  create() {
    this.scene.pause('Game');
    const end = this.add.dom(200, 125).createFromCache('end').setOrigin(0);

    const message = end.getChildByID('gameTitle');
    console.log(this.data.cause)
    if (this.data.cause == 'food') {
      message.innerHTML = 'Your People Died'
    } else if (this.data.cause == 'morale') {
      message.innerHTML = 'Your People Rebeled Against You'
    } else if (this.data.cause == 'destroyed') {
      message.innerHTML = 'Your Keep Was Destroyed'
    }
    const returnMenu = end.getChildByID('return');

    returnMenu.addEventListener('pointerup' , () => {
      this.scene.stop('Game');
      this.scene.start('Menu');
    }, this)
  }
}

// -------------------
// hud scene
// -------------------

// ------------------- //
// -- phaser config -- //
// ------------------- //
const config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
    parent: 'gameContainer',
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800,
    height: 500,
    // Minimum size
    min: {
        width: 800,
        height: 500
    },
    // Maximum size
    max: {
        width: 1500,
        height: 850
    },
    expandedParent: true
  },
  pixelArt: true,
  antialias: false,
  autoRound: true,
  backgroundColor: '#b8e3ff',
  dom: {
    createContainer: true
  },
  scene: [
    Boot,
    Menu,
    Game,
    HUD,
    Pause,
    End,
  ],
}

const game = new Phaser.Game(config);