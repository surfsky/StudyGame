import { Scene } from 'phaser';
import { Button } from '../forms/Button';
import { Mask } from './Mask';
import { Rect } from '../Rect';
import { DialogResult } from './DialogResult';
import { GameConfig } from '../../GameConfig';

/**
 * 对话框基类
 * @example
 * ```ts
 * var result = await new Dialog(this, 400, 300, '标题').show();
 * if (result === DialogResult.OK) {
 *     // 处理用户点击确定按钮的逻辑
 * } else if (result === DialogResult.Cancel) {
 *     // 处理用户点击取消按钮的逻辑
 * }
 * ```
 * new Dialog(this, 400, 300, '标题')
 *     .onClose((result)=>{})
 *     .show()
 *     ;
 *
 * new Dialog(this, 400, 300, '标题').show().then((result) => {
 *     if (result === DialogResult.OK) {
 *         // 处理用户点击确定按钮的逻辑
 *     } else if (result === DialogResult.Cancel) {
 *         // 处理用户点击取消按钮的逻辑
 *     }
 * });
 */
export class Dialog extends Phaser.GameObjects.Container {
    private result: DialogResult = DialogResult.Cancel;
    private showModel: boolean = true;  // 是否是模态对话框（即显示一个遮罩，禁止事件穿透下去）
    private masker: Mask|null = null;  // 遮罩对象


    // 关闭回调函数
    private closeCallback: (result: DialogResult) => void = () => { };
    public onClose(callback: (result: DialogResult) => void) {
        this.closeCallback = callback;
    }

    // 构造函数
    constructor(scene: Scene, text: string='', width: number=400, height: number=300, showModel: boolean=true) {
        const x = scene.cameras.main.centerX - width / 2;
        const y = scene.cameras.main.centerY - height / 2;

        super(scene, x, y);
        scene.add.existing(this);
        this.setSize(width, height);
        this.setDepth(GameConfig.depths.dialog);

        // 创建遮罩
        this.showModel = showModel;
        if (showModel){
            this.masker = new Mask(scene).setDepth(GameConfig.depths.dialog - 1);
            //this.add(this.masker);  // masker 独立存在
        }

        // 创建对话框背景
        var rect = new Rect(scene, 0, 0, width, height, 15, 0xffffff, 1, 0x000000, 2);
        this.add(rect);

        // 创建关闭按钮
        const closeButton = new Button(scene, width - 30, 30, 'X', {
            width: 30,
            height: 30,
            radius: 15,
            bgColor: 0xe74c3c,
            fontSize: '16px'
        }).on('click', () => this.close(DialogResult.Cancel));
        this.add(closeButton);

        // 创建文本
        if (text) {
            const label = scene.add.text(this.width / 2, this.height/2, text, {
                fontSize: 24,
                color: '#000000',
                align: 'center',
                lineSpacing: 20,
                wordWrap: {
                    width: this.width - 60,
                    useAdvancedWrap: true
                },
                padding: {x: 20, y: 20}
            }).setOrigin(0.5, 0.5);
            this.add(label);
        }

        // 创建标题
        this.setVisible(false);  // 初始化为隐藏状态
    }

    /**显示*/
    public async display() {
        await this.masker?.show();
        this.setVisible(true);
    }

    /**
     * Show module dialog
     * @param {Phaser.Scene} scene 
     * @returns {Promise<DialogResult>} 
     */
    public async show(): Promise<DialogResult> {
        return new Promise<DialogResult>(async (resolve) => {
            await this.display();
            this.onClose((result) => {
                resolve(result);
            });
        });
    }

    /**
     * 隐藏对话框
     */
    protected async close(result: DialogResult): Promise<void> {
        this.result = result;
        await this.masker?.hide();
        this.setVisible(false);
        this.closeCallback(this.result);
        this.masker?.destroy();
        this.destroy();
    }
}
