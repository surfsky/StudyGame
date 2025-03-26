import Phaser from 'phaser';
import { TextBox } from '../controls/forms/TextBox';

/**测试表单控件场景 */
export class TestForm extends Phaser.Scene {
    constructor() {
        super({ key: 'TestForm' });
    }

    preload() {
        // 预加载按钮图片
        this.load.image('icon-test', 'assets/icons/down.svg');
    }

    create() {
        // 文本框测试
        const textbox1 = new TextBox(this, 500, 380, {
            placeholder: '请输入文本'
        });
        const textbox2 = new TextBox(this, 500, 440, {
            type: 'number',
            placeholder: '请输入数字',
            bgColor: 0xf0f0f0,
            borderColor: 0x6c5ce7
        });


    }
}
