import { UIHelper } from '../../utils/UIHelper';

export interface PopupOptions {
    width?: number;
    height?: number;
    backgroundColor?: number;
    backgroundAlpha?: number;
    borderRadius?: number;
    padding?: number;
    modal?: boolean;
    modalAlpha?: number;
    animation?: 'fade' | 'scale' | 'slideDown' | 'none';
    animationDuration?: number;
    closeOnClickOutside?: boolean;
}

export class Popup extends Phaser.GameObjects.Container {
    private background!: Phaser.GameObjects.Graphics;
    private modalBackground: Phaser.GameObjects.Graphics | null = null;
    private contentContainer!: Phaser.GameObjects.Container;
    private options: Required<PopupOptions>;
    private isShowing: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number, options: PopupOptions = {}) {
        super(scene, x, y);
        scene.add.existing(this);

        // 设置默认选项
        this.options = {
            width: 400,
            height: 300,
            backgroundColor: 0xffffff,
            backgroundAlpha: 1,
            borderRadius: 10,
            padding: 20,
            modal: true,
            modalAlpha: 0.5,
            animation: 'fade',
            animationDuration: 200,
            closeOnClickOutside: true,
            ...options
        };

        this.createPopup();
        this.setVisible(false);
    }

    private createPopup(): void {
        // 创建模态背景
        if (this.options.modal) {
            this.modalBackground = this.scene.add.graphics();
            this.modalBackground.fillStyle(0x000000, this.options.modalAlpha);
            this.modalBackground.fillRect(
                -this.scene.cameras.main.width,
                -this.scene.cameras.main.height,
                this.scene.cameras.main.width * 2,
                this.scene.cameras.main.height * 2
            );
            this.add(this.modalBackground);

            if (this.options.closeOnClickOutside) {
                this.modalBackground.setInteractive(new Phaser.Geom.Rectangle(
                    -this.scene.cameras.main.width,
                    -this.scene.cameras.main.height,
                    this.scene.cameras.main.width * 2,
                    this.scene.cameras.main.height * 2
                ), Phaser.Geom.Rectangle.Contains);
                this.modalBackground.on('pointerdown', () => this.hide());
            }
        }

        // 创建弹窗背景
        this.background = this.scene.add.graphics();
        this.background.fillStyle(this.options.backgroundColor, this.options.backgroundAlpha);
        this.background.fillRoundedRect(
            -this.options.width / 2,
            -this.options.height / 2,
            this.options.width,
            this.options.height,
            this.options.borderRadius
        );
        this.add(this.background);

        // 创建内容容器
        this.contentContainer = this.scene.add.container(0, 0);
        this.contentContainer.setSize(this.options.width - this.options.padding * 2, this.options.height - this.options.padding * 2);
        this.add(this.contentContainer);
    }

    /**
     * 显示弹窗
     */
    public show(): void {
        if (this.isShowing) return;
        this.isShowing = true;
        this.setVisible(true);

        switch (this.options.animation) {
            case 'fade':
                this.alpha = 0;
                this.scene.tweens.add({
                    targets: this,
                    alpha: 1,
                    duration: this.options.animationDuration
                });
                break;
            case 'scale':
                this.setScale(0);
                this.scene.tweens.add({
                    targets: this,
                    scale: 1,
                    duration: this.options.animationDuration,
                    ease: 'Back.out'
                });
                break;
            case 'slideDown':
                const originalY = this.y;
                this.y = -this.options.height;
                this.scene.tweens.add({
                    targets: this,
                    y: originalY,
                    duration: this.options.animationDuration,
                    ease: 'Power2.out'
                });
                break;
        }
    }

    /**
     * 隐藏弹窗
     */
    public hide(): void {
        if (!this.isShowing) return;

        const onComplete = () => {
            this.isShowing = false;
            this.setVisible(false);
        };

        switch (this.options.animation) {
            case 'fade':
                this.scene.tweens.add({
                    targets: this,
                    alpha: 0,
                    duration: this.options.animationDuration,
                    onComplete
                });
                break;
            case 'scale':
                this.scene.tweens.add({
                    targets: this,
                    scale: 0,
                    duration: this.options.animationDuration,
                    ease: 'Back.in',
                    onComplete
                });
                break;
            case 'slideDown':
                this.scene.tweens.add({
                    targets: this,
                    y: this.scene.cameras.main.height + this.options.height,
                    duration: this.options.animationDuration,
                    ease: 'Power2.in',
                    onComplete
                });
                break;
            default:
                onComplete();
        }
    }

    /**
     * 添加内容到弹窗
     * @param {Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[]} items - 要添加的游戏对象或对象数组
     */
    public addContent(items: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[]): void {
        this.contentContainer.add(items);
    }

    /**
     * 清除弹窗内容
     */
    public clearContent(): void {
        this.contentContainer.removeAll();
    }

    /**
     * 销毁弹窗
     */
    public destroy(): void {
        if (this.modalBackground) {
            this.modalBackground.destroy();
        }
        this.background.destroy();
        this.contentContainer.destroy();
        super.destroy();
    }
}