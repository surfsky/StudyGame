import Phaser from 'phaser';
import { Control } from './Control';

export interface TagOptions {
    /** 背景颜色 */
    bgColor?: number;
    /** 文本颜色 */
    textColor?: number;
    /** 圆角大小 */
    radius?: number;
    /** 内边距 */
    padding?: number;
    /** 文本样式 */
    textStyle?: Phaser.Types.GameObjects.Text.TextStyle;
}

/**
 * Tag控件 - 带有圆角矩形背景的文本标签
 */
export class Tag extends Control {
    private text: Phaser.GameObjects.Text;
    private options: TagOptions;

    constructor(scene: Phaser.Scene, x: number, y: number, text: string, options: TagOptions = {}) {
        super(scene, x, y);

        // 设置默认选项
        this.options = {
            bgColor: 0x3498db,
            textColor: 0xffffff,
            radius: 4,
            padding: 8,
            textStyle: {
                fontSize: '14px',
                color: '#ffffff',
                wordWrap: {}
            },
            ...options
        };

        // 创建文本
        this.text = scene.add.text(0, 0, text, {
            ...this.options.textStyle,
            color: this.colorToHex(this.options.textColor!)
        });
        this.add(this.text);

        // 设置控件大小
        const width = this.text.width + (this.options.padding! * 2);
        const height = this.text.height + (this.options.padding! * 2);
        this.setSize(width, height);

        // 居中文本
        this.text.setPosition(
            this.options.padding,
            this.options.padding
        );

        this.draw();
    }

    protected draw() {
        super.draw();

        // 清除之前的绘制
        this.graphics.clear();

        // 绘制圆角矩形背景
        this.graphics.fillStyle(this.options.bgColor!);
        this.graphics.lineStyle(0, 0x000000);
        this.graphics.fillRoundedRect(
            0,
            0,
            this.width,
            this.height,
            this.options.radius
        );
    }

    /**
     * 将数字颜色值转换为十六进制字符串
     */
    private colorToHex(color: number): string {
        return '#' + color.toString(16).padStart(6, '0');
    }

    /**
     * 设置文本内容
     */
    public setText(text: string): void {
        this.text.setText(text);
        // 更新控件大小
        const width = this.text.width + (this.options.padding! * 2);
        const height = this.text.height + (this.options.padding! * 2);
        this.setSize(width, height);
        // 重绘
        this.draw();
    }

    /**
     * 设置背景颜色
     */
    public setBackgroundColor(color: number): void {
        this.options.bgColor = color;
        this.draw();
    }

    /**
     * 设置文本颜色
     */
    public setTextColor(color: number): void {
        this.options.textColor = color;
        this.text.setColor(this.colorToHex(color));
    }
}