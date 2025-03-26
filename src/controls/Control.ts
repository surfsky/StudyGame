import Phaser from 'phaser';

export class Control extends Phaser.GameObjects.Container
{
    private rect: Phaser.GameObjects.Rectangle;
    public themeCls: string = 'default';

    constructor(scene: Phaser.Scene, x: number = 0, y: number = 0, width: number = 0, height: number = 0) {
        super(scene, x, y);
        this.rect = scene.add.rectangle(0, 0, width, height);
        this.add(this.rect);
        scene.add.existing(this);
    }

    public setSize(width: number, height: number): this {
        this.rect.setSize(width, height);
        return this;
    }

    public getSize(): { width: number; height: number } {
        return {
            width: this.rect.width,
            height: this.rect.height
        };
    }
}

