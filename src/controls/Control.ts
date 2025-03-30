import Phaser from 'phaser';

/**
 * 控件基类（实现定位、大小、样式等基础属性）
 * 默认基于 (0, 0) 定位
 */
export class Control extends Phaser.GameObjects.Container
{
    protected ox: number = 0;
    protected oy: number = 0;
    public themeCls: string = 'default';

    constructor(scene: Phaser.Scene, x: number = 0, y: number = 0, width: number = 0, height: number = 0) {
        super(scene, x, y);
        this.setSize(width, height);
        this.setOrigin(0, 0);
        scene.add.existing(this);
    }


    /**设置定位方式 */
    public setOrigin(px: number, py: number): this {
        this.ox = this.x - this.width * px;
        this.oy = this.y - this.height * py;
        this.relayout();
        return this;
    }

    /**刷新布局（子类需重载该方法） */
    public relayout(): void {
        // 重写此方法以实现自定义布局
    }

    /**获取容器边界 */
    public getBounds(): Phaser.Geom.Rectangle {
        const bounds = super.getBounds();
        bounds.x = this.ox;
        bounds.y = this.oy;
        bounds.width = this.width;
        bounds.height = this.height;
        return bounds;
    }

    public showBounds(): void {
        const bounds = this.getBounds();
        const graphics = this.scene.add.graphics();
        graphics.lineStyle(1, 0xa0a0a0);
        graphics.strokeRectShape(bounds);
    }
}


