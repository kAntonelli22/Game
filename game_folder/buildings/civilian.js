class House extends Building {
  constructor(scene, x, y, width, height, direction, tiles) {
    super(scene, x, y, width, height);
    this.gameScene = scene;
    this.direction = direction;
    this.type = 'house';
    this.name = 'house' + scene.houses.length;
    this.x = x;
    this.y = y;
    this.baseX = 32;
    this.baseY = 16;

    this.tiles = tiles
    if (this.gameScene.debugMode) {
      this.tiles.forEach(tile => {if (tile.tint = 0xffffff) {tile.tint = 0x0000ff}})
    }
    
    this.hp = 25;
    this.max_hp = 25;
    this.residents = [];
    this.foodStores = 0;

    this.image.setTexture('houseConstruction');

    this.add(this.image)
    this.scene.add.existing(this);
    scene.houses.push(this);
    console.log(this)

    this.gameScene.ui.popupHandler.plusOne('wood', '-50', this.x, this.y);
  }
  update(time, delta) {
    if (!this.underConstruction) {
      // if (this.foodStores < 8) {this.getFood();}
    if (this.residents.length < 4) {this.getResident();}
    } // code inside doesnt run when the building is being constructed
  }
  finishConstruction() {
    this.image.setTexture(`house${this.direction}`);
    this.underConstruction = false;
  }
  // getFood() {
  //   this.gameScene.food--;
  //   this.foodStores++;
  // }
  getResident() {
    let person = this.gameScene.unhoused[0]
    if (person) {
      person.home = this;
      this.residents.push(person);
    }
  }
  delete() {
    console.log('delete house')
    this.destroy();
    // remove timeouts
    // return tiles to original

  }
}