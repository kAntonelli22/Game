class popupContainer extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene);

    this.ui = scene;
    this.gameScene = scene.scene.get('Game');
    this.popups = [];
    this.milTab;
    this.indTab;
    this.civTab;

    this.farm;
    this.house;
    this.wall;
    this.tower;
    this.keep;
  }
  update(time, delta) {
    
  }
  infoPopup(building) {
    let domElement;
    // checks if the info popup is currently created
    if (!this.popups.some(popup => popup.type == 'info')) {
      domElement = this.ui.add.dom(800, 500).createFromCache('infoPopup').setOrigin(1);
    } else {
      let popup = this.popups.find(popup => popup.type == 'info');
      domElement = popup.domElement;
    }
    this.name = domElement.getChildByID('name');
    this.healthbar = domElement.getChildByID('healthbar');
    this.div3 = domElement.getChildByID('div3');
    this.div4 = domElement.getChildByID('div4');
    this.div5 = domElement.getChildByID('div5');
    // place information from the tile into the divs in the info panel
    this.name.innerHTML = building.name;
    this.healthbar.max = building.max_hp;
    this.healthbar.value = building.hp;
    switch (building.type) {
      case 'house':
        // this.div3.innerHTML = 'residents: ' + building.residents.length;
        this.div4.innerHTML = 'building food: ' + building.happiness;
        this.div5.innerHTML = 'building happinness: ' + building.happiness + '%';
        break;
      case 'farm':
      case 'woodcutter':
      case 'quarry':
      case 'mine':
      case 'tower':
        this.div3.innerHTML = 'workers: ' + building.workers.length;
        this.div4.innerHTML = 'efficiency: ' + building.efficiency + '%';
        this.div5.innerHTML = '';
        break;
      case 'wall':
      case 'keep':
        this.div3.innerHTML = '';
        this.div4.innerHTML = '';
        this.div5.innerHTML = '';
        break;
    }

    // object to be put in array
    const container = {type: 'info', domElement: domElement};
    this.popups.push(container);
  } // end of infoPopup
  catalogPopup(tab) {
    // creates dom element for catalog and puts it in a container
    const domElement = this.ui.add.dom(600, 500).createFromCache('catalogPopup').setOrigin(1);
    // domElement.setFixedSize(domElement.clientWidth, domElement.clientHeight);
    const container = {type: 'catalog', domElement: domElement};
    this.popups.push(container);
    const uiContainer = domElement.getChildByID('bottomContainer');
    this.milTab = domElement.getChildByID('milTab');
    this.indTab = domElement.getChildByID('indTab');
    this.civTab = domElement.getChildByID('civTab');
    // switches the tab to the correct one
    this.ui.switchTab(this[tab], this.ui.currentTab);

    // gets buttons from html
    this.farm = domElement.getChildByID('farm');
    this.house = domElement.getChildByID('house');
    this.wall = domElement.getChildByID('wall');
    this.tower = domElement.getChildByID('tower');
    this.keep = domElement.getChildByID('keep');

    // once must be explicit for some reason
    uiContainer.addEventListener('pointerup', (e) => {this.catalogListener(e);}, {once: false}, this);

  } // end of catalogPopup
  eventPopup(type) {

    switch(type) {
      case 'food':
        const domElement = this.ui.add.dom(0, 100).createFromCache('foodWarning').setOrigin(0);

        const container = {type: 'food', domElement: domElement};
        this.popups.push(container);
    }
  }
  plusOne(symbol, text, x, y) {
    const popupText = this.gameScene.add.text(0, 0, text, {font: '16px Arial'})
    let icon;
    if (symbol.charCodeAt(0) > 255) {
      icon = this.gameScene.add.text(20, 0, symbol, {font: '14px FontAwesome'})
    } else {
      icon = this.gameScene.add.image(20, 0, symbol).setOrigin(0)
    }
    const textContainer = this.gameScene.add.container(x - 10, y, [icon, popupText]).setDepth(100);
    this.gameScene.tweens.add({
        targets: textContainer,
        alpha: 0,
        y: textContainer.y - 40,
        duration: 1000,
        ease: 'Linear',
        onComplete: function () {
            textContainer.destroy();
        }
    });
  }
  destroyPopup(type) {
    const popup = this.popups.find(popup => popup.type == type)
    popup.domElement.destroy();
    this.popups.splice(this.popups.indexOf(popup), 1);
    this.ui.currentTab = 'none';
  }
  catalogListener(e) {
    // console.log('event target: ' + e.target.id)
    this.selectBuilding(e.target.id);
  }
  selectBuilding(building) {
    this.ui.scene.get('Game').building = building;
  }
}