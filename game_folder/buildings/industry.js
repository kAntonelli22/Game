class Bridge extends Building {
  constructor(scene, x, y, width, height, direction, tiles) {
    super(scene, x, y, width, height);
    this.gameScene = scene;
    this.direction;
    this.type = 'bridge';
    this.name = 'bridge' + scene.bridges.length;
    this.x = x;
    this.y = y;
    this.hp = 50;
    this.max_hp = 50;

    this.tiles = tiles;
    if (this.gameScene.debugMode) {
      this.tiles.forEach(tile => {if (tile.tint = 0xffffff) {tile.tint = 0x0000ff}})
    }

    this.image.setTexture(`bridge${this.direction}`)

    this.add(this.image);
    this.scene.add.existing(this);
    scene.bridges.push(this);

    this.gameScene.ui.popupHandler.plusOne('\ue2cd', '-5', this.x, this.y);
  }
  update(time, delta) {

  }
}

class Farm extends Building {
  constructor(scene, x, y, width, height, direction, tiles) {
    super(scene, x, y, width, height);
    this.gameScene = scene;
    this.type = 'farm';
    this.name = 'farm' + scene.farms.length;
    this.x = x;
    this.y = y;
    this.hp = 10;
    this.max_hp = 10;
    this.growth = 0;
    this.growthTime = 100000 / 100;

    this.tiles = tiles
    if (this.gameScene.debugMode) {
      this.tiles.forEach(tile => {if (tile.tint = 0xffffff) {tile.tint = 0x0000ff}})
    }

    this.efficiency = 100;
    this.workers = [];

    this.image.setTexture('farm0')
    this.add(this.image)
    this.gameScene.add.existing(this);
    this.gameScene.farms.push(this);

    this.gameScene.ui.popupHandler.plusOne('wood', '-10', this.x, this.y + 5);
    this.gameScene.ui.popupHandler.plusOne('stone', '-5', this.x, this.y - 5);

    this.growTimer;
  }
  update(time, delta) {

    if (this.growTimer == null) {
      this.growTimer = this.gameScene.time.addEvent({
        delay: this.growthTime,
        callback: this.changeGrowth,
        args: [this.gameScene, this.growth],
        callbackScope: this,
        loop: true,
      });
    }
    // handles the efficiency of the farm based on how many workers
    switch(this.workers.length) {
      case 0:
        this.efficiency = 0;
        if (!this.growTimer.paused) {this.growTimer.paused = true;}
        break;
      case 1:
        this.efficiency = 25;
        break;
      case 2:
        this.efficiency = 50;
        break;
      case 3:
        this.efficiency = 75;
        break;
      case 4:
        this.efficiency = 100;
        break;
    }
    if (this.growTimer.paused == true && this.efficiency > 0) {this.growTimer.paused = false;}
    this.growthTime = 250000 / this.efficiency;

    // searches for workers
    if (this.gameScene.unemployed.length > 0 && this.workers.length < 4) {
      this.getWorker()
    }
  }
  changeGrowth(scene, growth) {
    if (this.growth < 2) {
      this.growth++;
      this.image.setTexture(`farm${this.growth}`)
    } else {
      this.growth = 0;
      this.image.setTexture('farm0')
      scene.food += 10;
      this.gameScene.ui.popupHandler.plusOne('\ue2cd', '+1', this.x, this.y);
    }
    if (this.growthTime != this.growTimer.delay) {this.growTimer.delay = this.growthTime;}
  }
  getWorker() {
    let worker = this.gameScene.unemployed[0];
    worker.work = {type: 'farm', building: this}
    this.workers.push(worker);
  }
  delete() {
    this.growTimer.destroy();
    // lays off the workers
    this.workers.forEach(worker => {worker.work = 'unemployed';});
    this.destroy();
  }
}

class Woodcutter extends Building {
  constructor(scene, x, y, width, height, direction, tiles) {
    super(scene, x, y, width, height);
    this.gameScene = scene;
    this.direction = direction;
    this.type = 'woodcutter';
    this.name = 'woodcutter' + scene.woodcutters.length;
    this.x = x;
    this.y = y;
    this.hp = 20;
    this.max_hp = 20;

    this.radius = 150;
    this.points = [
      x, y - (this.radius / 2),
      x - this.radius, y,
      x, y + (this.radius / 2),
      x + this.radius, y
    ];

    this.area = new Phaser.Geom.Polygon(this.points);
    
    if (this.gameScene.debugMode) {
      scene.add.image(this.points[0], this.points[1], 'texture')
      scene.add.image(this.points[2], this.points[3], 'texture')
      scene.add.image(this.points[4], this.points[5], 'texture')
      scene.add.image(this.points[6], this.points[7], 'texture')
    }
    

    this.efficiency = 100;
    this.workers = [];

    this.tiles = tiles
    if (this.gameScene.debugMode) {
      this.tiles.forEach(tile => {if (tile.tint = 0xffffff) {tile.tint = 0x0000ff}})
    }

    this.image.setTexture(`woodcutter${this.direction}`);

    this.add(this.image)
    this.scene.add.existing(this);

    this.gameScene.ui.popupHandler.plusOne('wood', '-25', this.x, this.y);
    // timer for quarry
      this.woodcutterTick;
      this.tickTime = 5000;
    }
    update(time, delta) {
      if (this.woodcutterTick == null) {
        this.woodcutterTick = this.gameScene.time.addEvent({
          delay: this.tickTime,
          callback: this.findTree,
          args: [],
          callbackScope: this,
          loop: true,
        });
      }
    // handles the efficiency of the woodcutter based on how many workers
    switch(this.workers.length) {
      case 0:
        this.efficiency = 0;
        break;
      case 1:
        this.efficiency = 50;
        break;
      case 2:
        this.efficiency = 100;
        break;
    }

    // searches for workers
    if (this.gameScene.unemployed.length > 0 && this.workers.length < 2) {
      this.getWorker()
    }
  }
  findTree() {
    let trees = []
    let tree;
    this.gameScene.trees.forEach(tree => {
      if (this.area.contains(tree.x, tree.y)) {
        trees.push(tree)
      }
    }) 
    if (trees.length) {
      console.log(trees)
      tree = Phaser.Utils.Array.GetRandom(trees);
      this.gameScene.ui.popupHandler.plusOne('wood', '+5', tree.x, tree.y);
      this.gameScene.wood += 5
      this.gameScene.trees.splice(this.gameScene.trees.indexOf(tree), 1)
      tree.destroy();
    }
    // find closest tree within the geom circle
    // cut tree
    // get wood
  }
  getWorker() {
    let worker = this.gameScene.unemployed[0];
    worker.work = {type: 'woodcutter', building: this}
    this.workers.push(worker);
  }
  delete() {
    // lays off the workers
    this.workers.forEach(worker => {worker.work = 'unemployed';});
    this.destroy();
  }
}

class Quarry extends Building {
  constructor(scene, x, y, width, height, direction, tiles) {
    super(scene, x, y, width, height);
    this.gameScene = scene;
    this.direction = direction;
    this.type = 'quarry';
    this.name = 'quarry' + scene.quarries.length;
    this.x = x;
    this.y = y;
    this.hp = 20;
    this.max_hp = 20;

    this.tiles = tiles
    if (this.gameScene.debugMode) {
      this.tiles.forEach(tile => {if (tile.tint = 0xffffff) {tile.tint = 0x0000ff}})
    }

    this.image.setTexture(`quarry${this.direction}`)

    this.add(this.image)
    this.scene.add.existing(this);

    this.gameScene.ui.popupHandler.plusOne('\ue2cd', '-5', this.x, this.y);

    // timer for quarry
    this.quarryTick;
    this.tickTime = 5000;
  }
  update(time, delta) {
    if (this.quarryTick == null) {
      this.quarryTick = this.gameScene.time.addEvent({
        delay: this.tickTime,
        callback: this.addStone,
        args: [],
        callbackScope: this,
        loop: true,
      });
    }
  }
  addStone() {
    this.gameScene.stone += 5;
    this.gameScene.ui.popupHandler.plusOne('stone', '+5', this.x, this.y)
  }
}

class Mine extends Building {
  constructor(scene, x, y, width, height, direction, tiles) {
    super(scene, x, y, width, height);
    this.gameScene = scene;
    this.direction = direction;
    this.type = 'mine';
    this.name = 'mine' + scene.mines.length;
    this.x = x;
    this.y = y;
    this.hp = 20;
    this.max_hp = 20;

    this.tiles = tiles
    if (this.gameScene.debugMode) {
      this.tiles.forEach(tile => {if (tile.tint = 0xffffff) {tile.tint = 0x0000ff}})
    }

    this.image.setTexture(`mine${this.direction}`)

    this.add(this.image)
    this.scene.add.existing(this);

    this.gameScene.ui.popupHandler.plusOne('\ue2cd', '-5', this.x, this.y);
    
    // timer for mine
      this.mineTick;
      this.tickTime = 7500;
    }
    update(time, delta) {
      if (this.mineTick == null) {
        this.mineTick = this.gameScene.time.addEvent({
          delay: this.tickTime,
          callback: this.addIron,
          args: [],
          callbackScope: this,
          loop: true,
        });
      }
    }
    addIron() {
      this.gameScene.iron += 4;
      this.gameScene.ui.popupHandler.plusOne('iron', '+4', this.x, this.y)
    }
}