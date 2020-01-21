import MouseInterface from './mouse-interface';

export const SCENE_KEY = 'DragSelectPlugin:InterfaceScene';

export default class InterfaceScene extends Phaser.Scene {
  constructor(scenePlugin) {
    super({ key: SCENE_KEY, active: true });

    scenePlugin.add(SCENE_KEY, this, true);
    scenePlugin.bringToTop(SCENE_KEY);
  }

  create() {
    this.mouseInterface = new MouseInterface(this);
  }

  destroy() {
    super.destroy(true);
    this.mouseInterface.destroy(true);
  }

}