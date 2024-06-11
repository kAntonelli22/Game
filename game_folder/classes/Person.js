// class Person extends Phaser.GameObjects.Sprite {
class Person extends Phaser.GameObjects.Container {
  // constructor(scene, x, y, texture, frame) {
  constructor(scene, x, y) {
    super(scene);
    this.gameScene = scene;
    // this.hunger = 100;
    this.happiness = {food: 100, home: 100, work: 100, safe: 100}; // tracks the happiness of the person
    this.happinessTotal = this.happiness.food + this.happiness.home + this.happiness.safe + this.happiness.work / 4;
    this.home = 'homeless'; // container that represents the home that they live in
    this.work = 'unemployed'; // container that represents the workplace that they work at

    // this.hungerTimer;
    this.happinessTimer;
    // place person on screen
  }
  update (time, delta) {

    // creates timer for hunger if object was just created and doesnt already have one
    // if (this.hungerTimer == null) {
    //   this.hungerTimer = this.gameScene.time.addEvent({
    //     delay: 10000,
    //     callback: this.eatFood,
    //     callbackScope: this,
    //     loop: true,
    //   })
    // }
    // if (this.happinessTimer == null) {
    //   this.happinessTimer = this.gameScene.time.addEvent({
    //     delay: 10000,
    //     callback: this.updateHappiness,
    //     callbackScope: this,
    //     loop: true,
    //   })
    // }

    // if (this.hunger <= 0) {
    //   this.die();
    // }
  }
  // eatFood() {
  //   if (this.home != 'homeless') {
  //     // get food from home
  //     if (this.home.food > 0 && this.hunger <= 80) {
  //       this.home.food--; this.hunger += 20;
  //     } else {this.hunger -= 10;}
  //   } else {
  //     if (this.gameScene.food > 0 && this.hunger <= 80) {
  //       this.gameScene.food--; this.hunger += 20;
  //     } else {this.hunger -= 10;}
  //   }
  //   // console.log('eatFood run. current hunger: ' + this.hunger)
  // }
  // updateHappiness() {
  //   // updates this.happiness.food
  //   if (this.hunger < 50) {
  //     this.happiness.food += 10;
  //     if (this.happiness.food > 100) {this.happiness.food = 100;}
  //   } else {
  //     this.happiness.food -= 10;
  //     if (this.happiness.food < 0) {this.happiness.food = 0;}
  //   }
  //   // ------------------ //
  //   // updates this.happiness.home
  //   if (this.home != 'homeless') {
  //     this.happiness.home += 10;
  //     if (this.happiness.home > 100) {this.happiness.home = 100;}
  //   } else {
  //     this.happiness.home -= 10;
  //     if (this.happiness.home < 0) {this.happiness.home = 0;}
  //   }
  //   // ------------------ //
  //   // updates this.happiness.work
  //   if (this.work != 'unemployed') {
  //     this.happiness.work += 10;
  //     if (this.happiness.work > 100) {this.happiness.work = 100;}
  //   } else {
  //     this.happiness.work -= 10;
  //     if (this.happiness.work < 0) {this.happiness.work = 0;}
  //   }
  //   // ------------------ //
  //   // updates this.happiness.safety
  //   // if (this.home != 'homeless') {
  //   //   this.happiness.home += 10;
  //   //   if (this.happiness.home > 100) {this.happiness.home = 100;}
  //   // } else {
  //   //   this.happiness.home -= 10;
  //   //   if (this.happiness.home < 0) {this.happiness.home = 0;}
  //   // }
  // }
  die() {
    console.log('person died');
    this.hungerTimer.destroy();
    this.happinessTimer.destroy();
    this.destroy();
  }
}