import Phaser from 'phaser';
import {Painter} from './Painter';

/**
 * 控件基类（实现定位、大小、样式等基础属性）
 * 默认基于 (0, 0) 定位
 */
export class Control extends Phaser.GameObjects.Container
{
    public themeCls: string = 'default';
    protected graphics : Phaser.GameObjects.Graphics;
    private _showBounds: boolean = false;



    constructor(scene: Phaser.Scene, x: number = 0, y: number = 0, width: number = 0, height: number = 0) {
        super(scene, x, y);
        this.graphics = this.scene.add.graphics();
        this.add(this.graphics);

        this.setSize(width, height);
        scene.add.existing(this);
    }

    //------------------------------------------------
    // Draw
    //------------------------------------------------
    protected draw() {
        this.graphics.clear();
        if (this._showBounds){
            this.drawBounds();
        }
    }

    public showBounds(value: boolean) : Control {
        this._showBounds = value;
        this.draw();
        return this;
    }

    protected drawBounds(options: { lineColor?: number, lineWidth?: number, dashLength?:number, gapLength?:number } = {}): void {
        const bounds = this.getBounds();
        const lineColor = options.lineColor ?? 0xa0a0a0;
        const lineWidth = options.lineWidth ?? 1;
        const dashLength = options.dashLength?? 3;
        const gapLength = options.gapLength?? 3;
        
        Painter.drawDashedRectangle(this.graphics, 0, 0, bounds.width, bounds.height, dashLength, gapLength, lineWidth, lineColor);
    }

    //------------------------------------------------
    // Layout
    //------------------------------------------------
    /**获取容器边界 */
    public getBounds(): Phaser.Geom.Rectangle {
        const bounds = super.getBounds();
        bounds.x = this.x;
        bounds.y = this.y;
        bounds.width = this.width;
        bounds.height = this.height;
        return bounds;
    }    
}


