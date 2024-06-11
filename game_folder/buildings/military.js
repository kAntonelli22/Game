class Keep extends Building {
  constructor(scene, x, y, width, height, direction, tiles) {
    super(scene, x, y, width, height);
    this.gameScene = scene;
    this.type = 'keep';
    this.name = 'keep';
    this.x = x;
    this.y = y;
    this.hp = 500;
    this.max_hp = 500;

    this.tiles = tiles
    
    if (this.gameScene.debugMode) {
      this.tiles.forEach(tile => {if (tile.tint == 0xffffff) {tile.tint = 0x0000ff}})
    }

    this.gameScene.keepPlaced = true;
    this.gameScene.stone += 500;
    this.gameScene.wood += 500;
    this.gameScene.population += 50;
    this.gameScene.gold += 100;
    this.gameScene.food += 50;
    
    this.image.setTexture('keep')
    this.add(this.image);
    this.scene.add.existing(this);

    for (let i = 0; i < 10; i++) {
      scene.people.add(new Person(scene, x, y));
    }

    // basic food system timer
    this.gameScene.time.addEvent({
      delay: 2500,
      callback: this.food,
      callbackScope: this,
      loop: true,
    })
  }
  update(time, delta) {

  }
  food() {
    this.gameScene.food -= Math.round(this.gameScene.population / 4);

    // add popup to tell player that they are about to lose
    if (this.gameScene.food < 0) {
      let popup = this.gameScene.ui.popupHandler.popups.find(popup => popup.type == 'food');
      if (popup) {
        if (popup.domElement.node.children[4].children[1].children[0].value <= 0) {this.gameScene.endGame('food');}
        popup.domElement.node.children[4].children[1].children[0].value -= 10;
      } else {
        console.log('bong')
        this.gameScene.ui.popupHandler.eventPopup('food');
      }
    }
  }
  delete() {
    console.log('cannot delete keep')
  }
}

class Tower extends Building {
  constructor(scene, x, y, width, height, direction, tiles) {
    super(scene, x, y, width, height);
    this.gameScene = scene;
    this.direction = direction;
    this.type = 'tower';
    this.name = 'tower' + scene.towers.length;
    this.x = x;
    this.y = y;
    this.hp = 150;
    this.max_hp = 150;

    this.tiles = tiles
    if (this.gameScene.debugMode) {
      this.tiles.forEach(tile => {if (tile.tint = 0xffffff) {tile.tint = 0x0000ff}})
    }

    this.image.setTexture('tower')
    this.add(this.image);

    this.workers = [];

    this.scene.add.existing(this);
    scene.towers.push(this);

    function shootArrow(target) {
      // create arrow at tower location
      // arrow travels to target location
      // target is damaged by arrow
    }
  }
  update(time, delta) {

  }
  delete() {
    console.log('delete tower')
    // refund resources
    this.gameScene.wood += 25;
    this.gameScene.stone += 75;
    this.gameScene.ui.popupHandler.plusOne('wood', '+25', this.x, this.y);
    this.gameScene.ui.popupHandler.plusOne('stone', '+75', this.x, this.y);
    this.destroy();
    // remove timeouts
  }
}

class Wall extends Building {
  constructor(scene, x, y, width, height, direction, tiles) {
    super(scene, x, y, width, height, );
    this.gameScene = scene;
    this.direction = direction;
    this.type = 'wall';
    this.name = 'wall' + scene.walls.length;
    this.x = x;
    this.y = y;
    this.hp = 100;
    this.max_hp = 100;

    this.tiles = tiles
    if (this.gameScene.debugMode) {
      this.tiles.forEach(tile => {if (tile.tint = 0xffffff) {tile.tint = 0x0000ff}})
    }

    this.image.setTexture('wall')
    this.add(this.image);

    scene.walls.push(this);
    this.scene.add.existing(this);

  }
  update(time, delta) {

  }
  delete() {
    console.log('delete wall')
    // refund resources
    this.gameScene.stone += 50;
    this.gameScene.ui.popupHandler.plusOne('stone', '+50', this.x, this.y);
    this.destroy();
    // remove timeouts
  }
}

// transition to objects