import Phaser from 'phaser';

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
    /** 图标缩放比例 */
    iconScale?: number;
    /** 图标与文本的间距 */
    iconSpacing?: number;
    /** 图标位置，可选值：'left' | 'right' | 'top' | 'bottom' */
    iconPosition?: string;
    /** 禁用状态下的透明度 */
    disabledAlpha?: number;
}

/*********************************************************
 * 按钮控件，支持文本和图标的组合显示。默认 origin(0, 0)
 *********************************************************/
export class Button extends Phaser.GameObjects.Container {
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
        disabledAlpha: 0.5
    };

    private options: ButtonOptions;
    private background!: Phaser.GameObjects.Graphics;
    private label?: Phaser.GameObjects.Text;
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
    constructor(scene: Phaser.Scene, x: number, y: number, text?: string, options: ButtonOptions = {}) {
        super(scene, x, y);
        this.options = { ...Button.DEFAULT_OPTIONS, ...options };
        this.init(text);
        scene.add.existing(this);
    }

    private init(text?: string): void {
        // 创建背景
        this.background = this.scene.add.graphics();
        this.drawBackground();
        this.add(this.background);

        // 创建文本（如果提供）
        if (text) {
            this.label = this.scene.add.text(0, 0, text, {
                fontSize: this.options.fontSize,
                color: this.options.textColor,
                align: 'center'
            }).setOrigin(0.5);
            this.add(this.label);
        }

        this.setSize(this.options.width!, this.options.height!);
        this.setInteractive({ cursor: 'pointer' });
        this.setEvents();
    }

    /**绘制背景 */
    private drawBackground(): void {
        const { width, height, radius, bgColor, borderColor, borderWidth } = this.options;
        this.background.clear();
        this.background.fillStyle(bgColor!, 1);
        this.background.fillRoundedRect(-width!/2, -height!/2, width!, height!, radius!);

        // border
        if (borderWidth! > 0) {
            this.background.lineStyle(borderWidth!, borderColor!, 1);
            this.background.strokeRoundedRect(-width!/2, -height!/2, width!, height!, radius!);
        }
    }

    //----------------------------------------------------------
    // 事件处理
    //----------------------------------------------------------
    private setEvents(): void {
        this.on('pointerover', this.onPointerOver, this)
            .on('pointerout', this.onPointerOut, this)
            .on('pointerdown', this.onPointerDown, this)
            .on('pointerup', this.onPointerUp, this);
    }

    private onPointerOver(): void {
        if (!this.isEnabled) return;
        this.background.clear();
        this.background.fillStyle(this.options.hoverColor!, 1);
        this.drawBackground();
    }

    private onPointerOut(): void {
        if (!this.isEnabled) return;
        this.background.clear();
        this.background.fillStyle(this.options.bgColor!, 1);
        this.drawBackground();
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

        if (this.icon && this.label) {
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
            if (this.icon) this.icon.setPosition(0, 0);
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

    /**
     * 设置按钮样式
     * @param options 样式选项
     */
    public setStyle(options: Partial<ButtonOptions>): this {
        this.options = { ...this.options, ...options };
        this.drawBackground();
        if (this.label) {
            this.label.setStyle({
                fontSize: this.options.fontSize,
                color: this.options.textColor
            });
        }
        if (this.icon) {
            this.icon.setScale(this.options.iconScale!);
        }
        this.updateLayout();
        return this;
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
}