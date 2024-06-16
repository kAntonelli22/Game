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
    
    this.image.setTexture('keep').setTint(0x00ff00);
    this.add(this.image);
    this.scene.add.existing(this);

    // add starting settlers
    this.createNewPeople(10);

    // basic food system timer
    this.gameScene.time.addEvent({
      delay: 2500,
      callback: this.food,
      callbackScope: this,
      loop: true,
    })

    // basic population system timer
    this.gameScene.time.addEvent({
      delay: 2500,
      callback: this.checkPop,
      callbackScope: this,
      loop: true,
    })
  }
  update(time, delta) {
    if (!this.underConstruction) {
      
    } // code inside doesnt run when the building is being constructed
  }
  finishConstruction() {
    this.image.setTexture('keep').setTint(0xffffff);
    this.underConstruction = false;
  }
  food() {
    this.gameScene.food -= Math.round(this.gameScene.population / 4);
    let popup = this.gameScene.ui.popupHandler.popups.find(popup => popup.type == 'food');

    // add popup to tell player that they are about to lose
    if (this.gameScene.food < 0) {
      if (popup) {
        if (popup.domElement.node.children[5].children[1].children[0].value <= 0) {this.gameScene.endGame('food');}
        popup.domElement.node.children[5].children[1].children[0].value -= 10;
      } else {
        this.gameScene.ui.popupHandler.eventPopup('food');
      }
    } else if (popup) {
      if (popup.domElement.node.children[5].children[1].children[0].value < 90) {
        popup.domElement.node.children[5].children[1].children[0].value += 10;
      } else {
        this.gameScene.ui.popupHandler.destroyPopup('food');
      }
    }
  }
  checkPop() {
    let maxPop = this.gameScene.houses.length * 4;
    let pop = this.gameScene.population;
    let popup = this.gameScene.ui.popupHandler.popups.find(popup => popup.type == 'homeless');
    if (pop < maxPop - 10) {
      this.createNewPeople(10);
    } else if (pop < maxPop) {
      this.createNewPeople(maxPop - pop)
    } else if (pop > maxPop) {
      if (popup) {
        if (popup.domElement.node.children[5].children[1].children[0].value <= 0) {
          console.log('before: ', this.gameScene.unhoused.length)
          this.gameScene.unhoused[0].die();
          console.log('after: ', this.gameScene.unhoused.length)
        }
        popup.domElement.node.children[5].children[1].children[0].value -= 10;
      } else {
        console.log('bong')
        this.gameScene.ui.popupHandler.eventPopup('homeless');
      }
    }
    if (popup && pop <= maxPop) {
      if (popup.domElement.node.children[5].children[1].children[0].value < 90) {
        popup.domElement.node.children[5].children[1].children[0].value += 10;
      } else {
        this.gameScene.ui.popupHandler.destroyPopup('homeless');
      }
    }
  }
  createNewPeople(number) {
    for (let i = 0; i < number; i++) {
      this.gameScene.people.add(new Person(this.gameScene, this.x, this.y));
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

    this.image.setTexture('tower').setTint(0x00ff00)
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
    if (!this.underConstruction) {
      
    } // code inside doesnt run when the building is being constructed
  }
  finishConstruction() {
    this.image.setTexture('tower').setTint(0xffffff);
    this.underConstruction = false;
  }
  delete() {
    console.log('delete tower')
    // refund resources
    this.gameScene.wood += 25;
    this.gameScene.stone += 75;
    this.gameScene.ui.popupHandler.plusOne('wood', '+25', this.x, this.y);
    this.gameScene.ui.popupHandler.plusOne('stone', '+75', this.x, this.y);
    const index = this.gameScene.towers.indexOf(this);
    this.gameScene.towers.splice(index, 1);
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

    this.image.setTexture('wall').setTint(0x00ff00);
    this.add(this.image);

    scene.walls.push(this);
    this.scene.add.existing(this);

  }
  update(time, delta) {
    if (!this.underConstruction) {

    } // code inside doesnt run when the building is being constructed
  }
  finishConstruction() {
    this.image.setTexture('wall').setTint(0xffffff);
    this.underConstruction = false;
  }
  delete() {
    console.log('delete wall')
    // refund resources
    this.gameScene.stone += 50;
    this.gameScene.ui.popupHandler.plusOne('stone', '+50', this.x, this.y);
    const index = this.gameScene.walls.indexOf(this);
    this.gameScene.walls.splice(index, 1);
    this.destroy();
    // remove timeouts
  }
}

// transition to objects