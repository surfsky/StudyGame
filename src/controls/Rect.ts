import Phaser from 'phaser';
import { Control } from './Control';

/**
 * 矩形控件
 */
export class Rect extends Control {
    private g: Phaser.GameObjects.Graphics;

    constructor(scene: Phaser.Scene, 
        x: number = 0, y: number = 0, w: number = 0, h: number = 0, radius: number = 0, 
        bgColor: number = 0xffffff, bgAlpha: number = 1,
        borderColor: number = 0xf0f0f0, borderWidth: number = 1, borderAlpha: number = 1,
    ){
        super(scene, x, y);
        this.g = scene.add.graphics();
        this.draw(bgColor, bgAlpha, x, y, w, h, radius, borderColor, borderWidth, borderAlpha);
        scene.add.existing(this.g);
    }

    private draw(bgColor: number, bgAlpha: number, x: number, y: number, w: number, h: number, radius: number, borderColor: number, borderWidth: number, borderAlpha: number) {
        this.g.fillStyle(bgColor, bgAlpha);
        this.g.fillRoundedRect(x, y, w, h, radius);
        if (borderColor != -1) {
            this.g.lineStyle(borderWidth, borderColor, borderAlpha);
            this.g.strokeRoundedRect(x, y, w, h, radius);
        }
    }

    public destroy(): void {
        this.g.destroy();
        super.destroy();
    }
}
