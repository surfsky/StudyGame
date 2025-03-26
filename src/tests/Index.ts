import Phaser from 'phaser';
import { MessageBox } from '../controls/overlays/MessageBox';
import { Button } from '../controls/forms/Button';
import { TestBlock } from './TestBlock';
import { TestLayout } from './TestLayout';
import { TestForm } from './TestForm';
import { TestButton } from './TestButton';
import { TestTTS } from './TestTTS';
import { TestExcel } from './TestExcel';

/**测试场景列表 */
export class Index extends Phaser.Scene {
    constructor() {
        super({ key: 'TestIndex' });
    }

    create() {
        var centerX = this.cameras.main.width / 2;

        // 创建标题
        this.add.text(centerX, 50, 'Phaser UI 测试', {
            fontSize: '32px',
            color: '#000'
        }).setOrigin(0.5);

        // 定义测试场景列表
        const scenes = [
            { key: 'TestButton', title: '按钮' },
            { key: 'TestForm', title: '表单控件' },
            { key: 'TestLayout', title: '布局' },
            { key: 'TestBlock', title: 'BLOCK' },
            { key: 'TestTTS', title: 'TTS' },
            { key: 'TestExcel', title: 'Excel导入' },
        ];

        // 创建场景按钮
        scenes.forEach((scene, index) => {
            const button = new Button(this, centerX, 150 + index * 80, scene.title, {
                width: 200,
                height: 50,
                bgColor: 0x6c5ce7
            });
            button.on('click', () => {
                //this.scene.pause();
                //this.scene.launch(scene.key);
                this.scene.start(scene.key);
            });
        });
    }
}

// 创建游戏实例
const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.RESIZE,
        parent: 'game',
        width: '100%',
        height: '100%',
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [Index, TestBlock, TestLayout, TestForm, TestButton, TestTTS, TestExcel, MessageBox],
    backgroundColor: '#ffffff'
};

const game = new Phaser.Game(config);

// 监听窗口大小变化
window.addEventListener('resize', () => {
    game.scale.refresh();
});