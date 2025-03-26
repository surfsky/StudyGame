import { Control } from '../controls/Control';
import { GameObjects, Scene } from 'phaser';

export class WordItem extends Phaser.GameObjects.Container {
    private wordType: 'en' | 'cn' = 'en';
    private text: Phaser.GameObjects.Text;
    private background: Phaser.GameObjects.Graphics;
    private color: number;
    private isHighlighted: boolean = false;
    private static readonly MIN_WIDTH = 120;
    private static readonly MAX_WIDTH = 400;

    constructor(
        scene: Scene, 
        wordType: 'en' | 'cn',
        text: string,
        x: number,
        y: number,
        width: number = 140,
        height: number = 50
    ) {
        super(scene, x, y);
        scene.add.existing(this);
        
        // 设置属性
        this.wordType = wordType;
        this.width = width; //Math.min(Math.max(width, WordItem.MIN_WIDTH), WordItem.MAX_WIDTH);
        this.height = height;
        this.color = wordType == 'en' ? 0x4a90e2 : 0x90be6d;
        
        // 创建背景
        this.setSize(this.width, this.height);
        this.background = scene.add.graphics();
        this.drawBackground();
        
        // 创建文本
        const padding = 10;
        const maxWidth = this.width - padding * 2;
        this.text = scene.add.text(0, 0, text, {
            fontSize: '22px',
            color: '#ffffff',
            fontStyle: 'bold',
            wordWrap: { width: maxWidth },
            align: 'center'
        }).setOrigin(0.5);

        // 自动调整文字大小
        if (this.text.width > maxWidth || this.text.height > this.height - padding * 2) {
            const scaleX = maxWidth / this.text.width;
            const scaleY = (this.height - padding * 2) / this.text.height;
            const scale = Math.min(scaleX, scaleY, 1);
            const currentFontSize = parseInt(this.text.style.fontSize as string);
            this.text.setFontSize(Math.floor(currentFontSize * scale));
        }

        // 添加到容器
        this.add([this.background, this.text]);
        this.setDepth(2);

        // 添加点击事件（朗读功能）
        this.setInteractive();
        this.on('pointerdown', () => {
            this.speak(this.text.text);
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
        return super.getBounds();
    }

    /**获取文本内容 */
    getText(): string {
        return this.text.text;
    }

    /**朗读文本 */
    private speak(text: string) {
        window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
    }
}