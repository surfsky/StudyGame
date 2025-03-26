import Phaser from 'phaser';
import { Button } from '../controls/forms/Button';
import { GameButton } from '../controls/forms/GameButton';
import { TestBlock } from './TestBlock';
import { MessageBox } from '../controls/overlays/MessageBox';

/**测试表单控件场景 */
export class TestTTS extends Phaser.Scene {
    constructor() {
        super({ key: 'TestTTS' });
    }

    preload() {
        // 预加载按钮图片
        this.load.image('icon-test', 'assets/icons/down.svg');
        this.load.image('icon-back', 'assets/icons/left.svg');
    }

    create() {
        var speaker = window.speechSynthesis;
        var centerX = this.cameras.main.centerX;
        var centerY = this.cameras.main.centerY;

        // 添加返回按钮
        const backButton = new Button(this, 30, 30, '', {
            width: 40,
            height: 40,
            radius: 20,
            bgColor: 0x2ecc71,
        });
        backButton.setIcon('icon-back');
        backButton.on('click', () => {
            this.scene.start('TestIndex');
        });

        // 基础按钮测试
        const btn = new Button(this, centerX, centerY, '说人话');
        btn.onClick(()=>{
            try{
                speaker.speak(new SpeechSynthesisUtterance('你好。Hello world!'));
            }
            catch(e: any){
                MessageBox.show(this, '错误', '浏览器不支持语音合成。' + e.message, false);
            }
        });
        

    }
}

