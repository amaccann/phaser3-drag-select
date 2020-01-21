import { EVENT_MAP } from './constants';
import PluginConfig from './plugin-config';

const PREVENT_DEFAULT = e => e.preventDefault();

export default class MouseInterface extends Phaser.GameObjects.Graphics {
  isDisabled = false;
  isDragging = false;
  isMouseDown = false;

  start = new Phaser.Math.Vector2();
  end = new Phaser.Math.Vector2();

  constructor(scene) {
    super(scene);

    scene.add.existing(this);
    this.initialiseInputEvents();
  }

  getIsValidClickToTrack = button => {
    const mouseClickToTrack = PluginConfig.get('mouseClickToTrack');
    return button === mouseClickToTrack
  };

  initialiseInputEvents() {
    const { scene } = this;

    this.enableRightClick();

    scene.input.on('pointerdown', this.onPointerDown);
    scene.input.on('pointerup', this.onPointerUp);
    scene.input.on('pointermove', this.onPointerMove);
  }

  onPointerDown = (pointer) => {
    const isClickTypeToTrack = this.getIsValidClickToTrack(pointer.buttons);

    if (this.isDisabled || !isClickTypeToTrack) {
      return;
    }

    this.start.setTo(pointer.worldX, pointer.worldY);
    this.end.setTo(pointer.worldX, pointer.worldY);
    this.isMouseDown = true;
  };

  onPointerUp = () => {
    const { start, end } = this;

    this.isDragging = false;
    this.isMouseDown = false;

    const startX = start.x;
    const startY = start.y;
    const endX = end.x;
    const endY = end.y;

    // Find the respective topLeft & bottomRight coordinates
    const minX = Math.min(startX, endX);
    const minY = Math.min(startY, endY);
    const maxX = Math.max(startX, endX);
    const maxY = Math.max(startY, endY);

    const width = maxX - minX;
    const height = maxY - minY;
    const rectangle = new Phaser.Geom.Rectangle(minX, minY, width, height);

    this.scene.sys.events.emit(EVENT_MAP.ON_MOUSE_UP, rectangle);
  };

  enableRightClick(enable = true) {
    const { scene } = this;
    if (enable) {
      scene.game.canvas.oncontextmenu = PREVENT_DEFAULT;
    } else {
      scene.game.canvas.oncontextmenu = undefined;
    }
  }

  onPointerMove = pointer => {
    const isClickTypeToTrack = this.getIsValidClickToTrack(pointer.buttons);
    if (!this.isMouseDown || !isClickTypeToTrack) {
      return this;
    }

    this.isDragging = true;
    this.end.setTo(pointer.worldX, pointer.worldY);
  };

  preUpdate() {
    const { start, end } = this;
    this.clear();
    if (!this.isMouseDown) {
      return;
    }

    const color = PluginConfig.get('rectBgColor');
    const alpha = PluginConfig.get('rectAlpha');
    const lineWidth = PluginConfig.get('outlineWidth');
    const lineColor = PluginConfig.get('outlineColor');

    this.lineStyle(lineWidth, lineColor, 1);
    this.fillStyle(color, alpha);
    this.fillRect(start.x, start.y, end.x - start.x, end.y - start.y);
    this.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
  }
}