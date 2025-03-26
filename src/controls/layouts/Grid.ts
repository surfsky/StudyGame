import { GameObjects } from "phaser";
import { Control } from "../Control";

export class Grid extends GameObjects.Container  {
    private columnCount: number;
    private cellWidth: number;
    private cellHeight: number;
    private horizontalSpacing: number = 0;
    private verticalSpacing: number = 0;
    private horizontalAlignment: 'left' | 'center' | 'right' = 'left';
    private verticalAlignment: 'top' | 'center' | 'bottom' = 'top';

    constructor(scene: Phaser.Scene, x: number = 0, y: number = 0, config: {
        columnCount: number;
        cellWidth: number;
        cellHeight: number;
        horizontalSpacing?: number;
        verticalSpacing?: number;
        horizontalAlignment?: 'left' | 'center' | 'right';
        verticalAlignment?: 'top' | 'center' | 'bottom';
    }) {
        super(scene, x, y);
        scene.add.existing(this);

        this.columnCount = config.columnCount;
        this.cellWidth = config.cellWidth;
        this.cellHeight = config.cellHeight;
        this.horizontalSpacing = config.horizontalSpacing ?? this.horizontalSpacing;
        this.verticalSpacing = config.verticalSpacing ?? this.verticalSpacing;
        this.horizontalAlignment = config.horizontalAlignment ?? this.horizontalAlignment;
        this.verticalAlignment = config.verticalAlignment ?? this.verticalAlignment;
    }

    /**
     * 添加子控件到网格容器
     * @param gameObjects 要添加的游戏对象或对象数组
     */
    public addContent(gameObjects: GameObjects.GameObject | GameObjects.GameObject[]): void {
        const items = Array.isArray(gameObjects) ? gameObjects : [gameObjects];
        items.forEach(item => this.add(item));
        this.updateLayout();
    }

    /**
     * 移除子控件
     * @param gameObjects 要移除的游戏对象或对象数组
     */
    public removeContent(gameObjects: GameObjects.GameObject | GameObjects.GameObject[]): void {
        const items = Array.isArray(gameObjects) ? gameObjects : [gameObjects];
        items.forEach(item => this.remove(item));
        this.updateLayout();
    }

    /**
     * 清除所有子控件
     */
    public clearContent(): void {
        this.removeAll();
        this.updateLayout();
    }

    /**
     * 更新布局
     */
    private updateLayout(): void {
        const rowCount = Math.ceil(this.list.length / this.columnCount);
        const totalWidth = this.columnCount * this.cellWidth + (this.columnCount - 1) * this.horizontalSpacing;
        const totalHeight = rowCount * this.cellHeight + (rowCount - 1) * this.verticalSpacing;

        // 设置容器大小
        this.setSize(totalWidth, totalHeight);

        // 计算起始位置
        let startX = 0;
        let startY = 0;

        switch (this.horizontalAlignment) {
            case 'center':
                startX = -totalWidth / 2;
                break;
            case 'right':
                startX = -totalWidth;
                break;
        }

        switch (this.verticalAlignment) {
            case 'center':
                startY = -totalHeight / 2;
                break;
            case 'bottom':
                startY = -totalHeight;
                break;
        }

        // 设置每个子控件的位置
        this.list.forEach((item: GameObjects.GameObject, index: number) => {
            const row = Math.floor(index / this.columnCount);
            const col = index % this.columnCount;

            const x = startX + col * (this.cellWidth + this.horizontalSpacing) + this.cellWidth / 2;
            const y = startY + row * (this.cellHeight + this.verticalSpacing) + this.cellHeight / 2;

            // 调整子控件大小以适应单元格
            if ((item as any).setDisplaySize) {
                (item as any).setDisplaySize(this.cellWidth, this.cellHeight);
            }

            //item.setPosition(x, y);
            var t = (item as any) as Phaser.GameObjects.Components.Transform;
            t.setPosition(x, y);
        });
    }

    /**
     * 设置水平间距
     * @param value 间距值
     */
    public setHorizontalSpacing(value: number): this {
        this.horizontalSpacing = value;
        this.updateLayout();
        return this;
    }

    /**
     * 设置垂直间距
     * @param value 间距值
     */
    public setVerticalSpacing(value: number): this {
        this.verticalSpacing = value;
        this.updateLayout();
        return this;
    }

    /**
     * 设置水平对齐方式
     * @param value 对齐方式
     */
    public setHorizontalAlignment(value: 'left' | 'center' | 'right'): this {
        this.horizontalAlignment = value;
        this.updateLayout();
        return this;
    }

    /**
     * 设置垂直对齐方式
     * @param value 对齐方式
     */
    public setVerticalAlignment(value: 'top' | 'center' | 'bottom'): this {
        this.verticalAlignment = value;
        this.updateLayout();
        return this;
    }

    /**
     * 设置列数
     * @param value 列数
     */
    public setColumnCount(value: number): this {
        this.columnCount = value;
        this.updateLayout();
        return this;
    }

    /**
     * 设置单元格尺寸
     * @param width 宽度
     * @param height 高度
     */
    public setCellSize(width: number, height: number): this {
        this.cellWidth = width;
        this.cellHeight = height;
        this.updateLayout();
        return this;
    }
}