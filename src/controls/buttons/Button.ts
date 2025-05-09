import Phaser from 'phaser';
import { Control } from '../Control';

/**按钮控件配置选项 */
export interface ButtonOptions {
    /** 按钮宽度 */
    width?: number;
    /** 按钮高度 */
    height?: number;
    /** 圆角半径 */
    radius?: number;
    /** 文本大小 */
    fontSize?: string;
    /** 文本颜色 */
    textColor?: string;
    /** 内边距 */
    padding?: number;
    /** 背景颜色 */
    bgColor?: number;
    /** 悬停时的背景颜色 */
    hoverColor?: number;
    /** 边框颜色 */
    borderColor?: number;
    /** 边框宽度 */
    borderWidth?: number;
    /** 图标资源键 */
    icon?: string;
    /** 图标宽度 */
    iconWidth?: number;
    /** 图标高度 */
    iconHeight?: number;
    /** 图标缩放比例 */
    iconScale?: number;
    /** 图标与文本的间距 */
    iconSpacing?: number;
    /** 图标位置，可选值：'left' | 'right' | 'top' | 'bottom' */
    iconPosition?: string;
    /** 禁用状态下的透明度 */
    disabledAlpha?: number;

    active?: boolean;
}

/*********************************************************
 * 按钮控件，支持文本和图标的组合显示。默认 origin(0, 0)
 *********************************************************/
export class Button extends Control {
    private static readonly DEFAULT_OPTIONS: ButtonOptions = {
        width: 200,
        height: 60,
        radius: 10,
        fontSize: '24px',
        textColor: '#ffffff',
        padding: 10,
        bgColor: 0x4a90e2,
        hoverColor: 0x5ba1f3,
        borderColor: 0x4a90e2,
        borderWidth: 0,
        iconScale: 1,
        iconSpacing: 5,
        iconPosition: 'left',
        disabledAlpha: 0.5,
        active: true
    };

    private options: ButtonOptions;
    private text: string;
    public label?: Phaser.GameObjects.Text;
    private icon?: Phaser.GameObjects.Image;
    private isEnabled: boolean = true;
    private isPressed: boolean = false; 

    /**
     * 创建按钮
     * @param scene 场景实例
     * @param x 按钮x坐标
     * @param y 按钮y坐标
     * @param text 按钮文本
     * @param options 按钮配置选项
     */
    constructor(scene: Phaser.Scene, x: number, y: number, text: string='', options: ButtonOptions = {}) {
        super(scene, x, y, options.width ?? Button.DEFAULT_OPTIONS.width!, options.height ?? Button.DEFAULT_OPTIONS.height!);
        this.options = { ...Button.DEFAULT_OPTIONS, ...options };
        this.text = text;
        this.draw();

        // 如果提供了图标，创建图标
        if (this.options.icon) {
            this.setIcon(this.options.icon, this.options.iconScale);
            if (this.icon && (this.options.iconWidth || this.options.iconHeight)) {
                const width = this.options.iconWidth || this.icon.width;
                const height = this.options.iconHeight || this.icon.height;
                this.icon.setDisplaySize(width, height);
            }
        }

        // events
        this.setSize(this.options.width!, this.options.height!);
        if (this.options.active)
            this.setEvents();
    }

    /**绘制背景 */
    override draw(): void {
        super.draw();

        //
        const { width, height, radius, bgColor, borderColor, borderWidth } = this.options;
        this.graphics.fillStyle(bgColor!, 1);
        this.graphics.fillRoundedRect(-width!/2, -height!/2, width!, height!, radius!);

        // border
        if (borderWidth! > 0) {
            this.graphics.lineStyle(borderWidth!, borderColor!, 1);
            this.graphics.strokeRoundedRect(-width!/2, -height!/2, width!, height!, radius!);
        }

        // 创建文本（如果提供）
        if (!this.label) {
            this.label = this.scene.add.text(0, 0, this.text, {
                fontSize: this.options.fontSize,
                color: this.options.textColor,
                align: 'center'
            }).setOrigin(0.5);
            this.add(this.label);
        }
        this.label.setText(this.text!);
    }

    //----------------------------------------------------------
    // 事件处理
    //----------------------------------------------------------
    private setEvents(): void {
        this.setInteractive({ cursor: 'pointer' });
        this.on('pointerover', this.onPointerOver, this)
            .on('pointerout', this.onPointerOut, this)
            .on('pointerdown', this.onPointerDown, this)
            .on('pointerup', this.onPointerUp, this);
    }

    private onPointerOver(): void {
        if (!this.isEnabled) return;
        this.graphics.clear();
        this.graphics.fillStyle(this.options.hoverColor!, 1);
        this.draw();
    }

    private onPointerOut(): void {
        if (!this.isEnabled) return;
        this.graphics.clear();
        this.graphics.fillStyle(this.options.bgColor!, 1);
        this.draw();
        if (this.isPressed) {
            this.isPressed = false;
            this.setScale(1);
        }
    }

    private onPointerDown(): void {
        if (!this.isEnabled) return;
        this.isPressed = true;
        this.setScale(0.95);
        this.emit('click');
    }

    private onPointerUp(): void {
        if (!this.isEnabled || !this.isPressed) return;
        this.isPressed = false;
        this.setScale(1);
    }

    /**
     * 添加点击事件监听器
     * @param callback 回调函数
     * @param context 上下文
     */
    public onClick(callback: Function, context?: any): this {
        this.on('click', callback, context);
        return this;
    }


    //----------------------------------------------------------
    // 公共方法
    //----------------------------------------------------------
    /**
     * 设置按钮文本
     * @param text 文本内容
     */
    public setText(text: string): this {
        if (!this.label) {
            this.label = this.scene.add.text(0, 0, text, {
                fontSize: this.options.fontSize,
                color: this.options.textColor,
                align: 'center'
            }).setOrigin(0.5);
            this.add(this.label);
        } else {
            this.label.setText(text);
        }
        this.updateLayout();
        return this;
    }

    /**
     * 设置按钮图标
     * @param key 图标资源键
     */
    public setIcon(key: string, scale:number=1.0): this {
        if (!this.icon) {
            this.icon = this.scene.add.image(0, 0, key)
                .setScale(scale)
                .setOrigin(0.5);
            this.add(this.icon);
        } else {
            this.icon.setTexture(key);
        }
        this.updateLayout();
        return this;
    }

    /**设置动画效果 */
    public setAnimate(): this {
        this.scene.tweens.add({
            targets: this,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        return this;
    }

    /**
     * 更新布局
     */
    private updateLayout(): void {
        if (!this.icon && !this.label) return;

        if (this.icon && this.label && this.label.text!='') {
            // 同时存在图标和文本时的布局
            const spacing = this.options.iconSpacing!;
            switch (this.options.iconPosition) {
                case 'left':
                    this.icon.setPosition(-spacing - this.label.width/2, 0);
                    this.label.setPosition(spacing + this.icon.width/2, 0);
                    break;
                case 'right':
                    this.icon.setPosition(spacing + this.label.width/2, 0);
                    this.label.setPosition(-spacing - this.icon.width/2, 0);
                    break;
                case 'top':
                    this.icon.setPosition(0, -spacing - this.label.height/2);
                    this.label.setPosition(0, spacing + this.icon.height/2);
                    break;
                case 'bottom':
                    this.icon.setPosition(0, spacing + this.label.height/2);
                    this.label.setPosition(0, -spacing - this.icon.height/2);
                    break;
            }
        } else {
            // 只有图标或只有文本时，居中显示
            if (this.icon)  this.icon.setPosition(0, 0).setOrigin(0.5);
            if (this.label) this.label.setPosition(0, 0);
        }
    }

    /**
     * 设置按钮启用状态
     * @param value 是否启用
     */
    public setEnabled(value: boolean): this {
        this.isEnabled = value;
        this.alpha = value ? 1 : this.options.disabledAlpha!;
        return this;
    }

    /**
     * 获取按钮启用状态
     */
    public isButtonEnabled(): boolean {
        return this.isEnabled;
    }

}