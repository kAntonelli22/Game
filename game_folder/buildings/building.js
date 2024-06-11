class Building extends Phaser.GameObjects.Container {
  constructor(scene, x, y, width, height) {
    super(scene, x, y);
    this.gameScene = scene;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.tiles = [];
    this.image = this.gameScene.add.image(0, 0, 'texture');

    this.debugRect = this.gameScene.add.rectangle(0, 0, this.width, this.height, 0xff00ff, 0);
    this.debugRect.setStrokeStyle(1, 0xff00ff).setAlpha(0);
    this.add(this.debugRect)
    this.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.width, this.height), Phaser.Geom.Rectangle.Contains);

    this.scene.add.existing(this);
    if (this.gameScene.debugMode) {
      this.image.setAlpha(0.75);
      this.debugHover();
    }
  }
  update(time, delta) {
    
  }
  debugHover() {
    this.on('pointerover', (pointer, gameObject) => {
      this.debugRect.setAlpha(0.5)
    })
    this.on('pointerout', (pointer, gameObject) => {
      this.debugRect.setAlpha(0)
    })
  }
}