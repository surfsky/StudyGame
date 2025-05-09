import { Scene } from 'phaser';
import { Dialog } from '../controls/overlays/Dialog';
import { Word } from './StudyDb';
import { Popup } from '../controls/overlays/Popup';
import { speak } from '../utils/Speaker.js';


/**单词项 */
export class WordItem extends Phaser.GameObjects.Container {
    private wordType: 'en' | 'cn' = 'en';
    private text: Phaser.GameObjects.Text;
    private background: Phaser.GameObjects.Graphics;
    private color: number;
    private isHighlighted: boolean = false;
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
        this.setEvents();
    }

    // 添加点击事件
    private setEvents() {
        this.setInteractive();
        let lastClickTime = Date.now();
        this.on('pointerdown', () => {
            const currentTime = Date.now();
            if (currentTime - lastClickTime < 300) { // 双击间隔300毫秒
                this.showWordDetails();      // 双击显示单词详细信息
            } else {
                this.speak(this.text.text);  // 单击朗读
            }
            lastClickTime = currentTime;
        });

        //var press = false;
        //this.on('pointerdown', ()=>{ press = true;});
        //this.on('pointerout', ()=>{ press = false;});
        //this.on('pointerup', ()=>{
        //    if (press) {
        //        this.speak(this.text.text);
        //        this.showWordDetails();
        //    }
        //});
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

    /**显示单词详细信息 */
    private async showWordDetails() {
        if (!this.word) return;
        let content = `${this.word.en}\n${this.word.cn}`;
        if (this.word.root != 'undefined') {
            content += `\n词根：${this.word.root}`;
        }

        // 显示对话框
        var centerX = this.scene.game.canvas.width/2;
        var centerY = this.scene.game.canvas.height/2;
        var dlgWidth = 300;
        var dlgHeight = 200;
        const dlg = new Popup(this.scene, centerX, centerY, {
            width: dlgWidth,
            height: dlgHeight,
            modal: true,
            showCloseButton: true,
            closeOnClickOutside: true,
            closeButtonStyle: {
                size: 30,
                color: 0xff0000,
            },
            dragable: true,
        });
        var lblTitle = this.scene.add.text(0, 0, content, {   // 定位有点问题，凑合着用
            fontSize: '24px',
            color: '#000000',
            wordWrap: { width: 280, useAdvancedWrap: true },
            padding: { left: 10, right: 10 },
            lineSpacing: 8,
            align: 'center'
        }).setOrigin(0.5);
        var btnSpeak = this.scene.add.image(16-dlgWidth/2, 10-dlgHeight/2, 'speak').setOrigin(0)
            .setInteractive()
            .setTint(0x0000ff) // 设置初始颜色为白色
            .on('pointerdown', () => {btnSpeak.setScale(0.9);})
            .on('pointerout',  () => {btnSpeak.setScale(1);})
            .on('pointerup', () => {
                btnSpeak.setScale(1);
                this.speak(this.word!.en);
            });
        dlg.addContent(lblTitle);
        dlg.addContent(btnSpeak);
        dlg.show();
    }


    /**朗读文本 */
    private speak(text: string) {
        speak(text);
        // 经测试，直接用这段代码pc端可以朗读，但是手机端不行
        // 而纯js+html经测试手机端可以朗读的，估计这段代码编译成js时有什么问题。
        // 所以采用js混合的方式，调用外部 Speaker.js 库，且为了编译通过，还写了 speaker.d.ts 文件。
        // 2025-09-05
        //window.speechSynthesis.cancel();
        //const utterance = new SpeechSynthesisUtterance(text);
        //utterance.lang = this.wordType === 'en' ? 'en-US' : 'zh-CN';
        //window.speechSynthesis.speak(utterance);
    }
}