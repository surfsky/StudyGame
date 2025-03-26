import Phaser from 'phaser';
import { Button } from '../controls/forms/Button';
import { GameButton } from '../controls/forms/GameButton';
import { TestBlock } from './TestBlock';

/**测试表单控件场景 */
export class TestButton extends Phaser.Scene {
    constructor() {
        super({ key: 'TestButton' });
    }

    preload() {
        // 预加载按钮图片
        this.load.image('icon-test', 'assets/icons/down.svg');
        this.load.image('icon-back', 'assets/icons/left.svg');
    }

    create() {
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
        const basicButton = new Button(this, 120, 100, '基础按钮');
        
        // 带图标的按钮
        const iconButton = new Button(this, 120, 200, '图标按钮', {
            iconPosition: 'left',
            width: 200,
            height: 60,
            bgColor: 0x6c5ce7
        });
        iconButton.setIcon('icon-test');

        // 禁用状态按钮
        const disabledButton = new Button(this, 120, 300, '禁用按钮', {
            bgColor: 0xe74c3c
        });
        disabledButton.setEnabled(false);

        // 自定义样式按钮
        const customButton = new Button(this, 120, 400, '自定义样式', {
            width: 200,
            height: 60,
            radius: 30,
            fontSize: '24px',
            bgColor: 0x2ecc71,
            hoverColor: 0x27ae60,
            borderColor: 0x2ecc71,
            borderWidth: 3
        });//.setOrigin(0);

    }
}

