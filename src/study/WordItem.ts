import { Scene } from 'phaser';
import { Dialog } from '../controls/overlays/Dialog';
import { Word } from './StudyDb';

export class WordItem extends Phaser.GameObjects.Container {
    private wordType: 'en' | 'cn' = 'en';
    private text: Phaser.GameObjects.Text;
    private background: Phaser.GameObjects.Graphics;
    private color: number;
    private isHighlighted: boolean = false;
    //private static readonly MIN_WIDTH = 120;
    //private static readonly MAX_WIDTH = 400;
    //private isScrolling: boolean = false;
    //private scrollText: Phaser.GameObjects.Text | null = null;
    //private scrollBackground: Phaser.GameObjects.Graphics | null = null;
    private word: Word | null = null;

    constructor(
        scene: Scene, 
        word: Word,
        wordType: 'en' | 'cn',
        text: string,
        x: number,
        y: number,
        width: number = 140,
        height: number = 50,
    ) {
        super(scene, x, y);
        scene.add.existing(this);
        
        // 设置属性
        this.wordType = wordType;
        this.width = width; //Math.min(Math.max(width, WordItem.MIN_WIDTH), WordItem.MAX_WIDTH);
        this.height = height;
        this.color = wordType == 'en' ? 0x4a90e2 : 0x90be6d;
        this.word = word || null;
        
        // 创建背景
        this.setSize(this.width, this.height);
        this.background = scene.add.graphics();
        this.drawBackground();
        this.add(this.background);
        
        // 创建文本
        const padding = 10;
        const maxWidth = this.width;
        this.text = scene.add.text(padding-this.width/2, 0, text, {
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold',
            wordWrap: { width: maxWidth, useAdvancedWrap: true },
            //padding: { left: padding, right: padding },
            align: 'left'
        }).setOrigin(0, 0.5);  // y轴居中, x轴左对齐
        this.add(this.text);

        // 
        //this.setDepth(2);

        // 添加点击事件
        this.setInteractive();
        let lastClickTime = 0;
        
        this.on('pointerdown', () => {
            const currentTime = Date.now();
            if (currentTime - lastClickTime < 300) { // 双击间隔300毫秒
                this.showWordDetails();
            } else {
                // 单击朗读
                this.speak(this.text.text);
            }
            lastClickTime = currentTime;
        });
    }

    /**是否为英文单词 */
    public isEn() {
        return this.wordType === 'en';
    }

    /**绘制背景 */
    private drawBackground(highlightColor?: number) {
        this.background.clear();
        this.background.fillStyle(highlightColor || this.color, 1);
        this.background.fillRoundedRect(
            -this.width/2,
            -this.height/2,
            this.width,
            this.height,
            15
        );

        // 如果处于高亮状态，绘制边框
        if (this.isHighlighted) {
            this.background.lineStyle(3, 0xff0000);
            this.background.strokeRoundedRect(
                -this.width/2,
                -this.height/2,
                this.width,
                this.height,
                15
            );
        }
    }

    /**设置高亮状态 */
    setHighlight(highlighted: boolean) {
        this.isHighlighted = highlighted;
        this.drawBackground();
    }

    /**获取容器边界 */
    getBounds(): Phaser.Geom.Rectangle {
        const bounds = super.getBounds();
        // 考虑容器的位置和大小
        bounds.x = this.x - this.width/2;
        bounds.y = this.y - this.height/2;
        bounds.width = this.width;
        bounds.height = this.height;
        return bounds;
    }

    /**获取文本内容 */
    getText(): string {
        return this.text.text;
    }

    /**朗读文本 */
    private speak(text: string) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = this.wordType === 'en' ? 'en-US' : 'zh-CN';
        window.speechSynthesis.speak(utterance);
    }

    /**显示单词详细信息 */
    private async showWordDetails() {
        if (!this.word) return;
        
        let content = `${this.word.en}\n${this.word.cn}`;
        if (this.word.root != 'undefined') {
            content += `\n词根：${this.word.root}`;
        }
        
        const dialog = new Dialog(this.scene, content);
        await dialog.show();
    }
}