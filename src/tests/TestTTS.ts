import { Button } from '../controls/buttons/Button';
import { TestScene } from './SceneBase';
import { MessageBox } from '../controls/overlays/MessageBox';

/**测试表单控件场景 */
export class TestTTS extends TestScene {
    constructor() {
        super('TestTTS');
    }

    preload() {
        // 预加载按钮图片
        this.load.image('icon-test', 'assets/icons/down.svg');
        this.load.image('icon-back', 'assets/icons/left.svg');
    }

    create() {
        this.createTitle("TTS");

        // 返回按钮
        const backButton = new Button(this, 30, 30, '', {
            width: 40,
            height: 40,
            radius: 20,
            bgColor: 0x2ecc71,
        }).setIcon('icon-back', 28).on('click', () => {
            this.scene.start('TestIndex');
        });

        // 说话按钮
        var centerX = this.cameras.main.centerX;
        var centerY = this.cameras.main.centerY;
        const btn = new Button(this, centerX, centerY, '说人话').onClick(()=>{
            try{
                var speaker = window.speechSynthesis;
                speaker.speak(new SpeechSynthesisUtterance('你好。Hello world!'));
            }
            catch(e: any){
                //MessageScene.show(this, '错误', '浏览器不支持语音合成。' + e.message, false);
                MessageBox.show(this, {title:"错误", message:"浏览器不支持语音合成。" + e.message});
            }
        });
    }
}

