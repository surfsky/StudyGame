import Phaser from 'phaser';
import { Button } from '../controls/forms/Button';

/**测试基础控件场景 */
export class TestScene extends Phaser.Scene {
    constructor(key: string) {
        super({ key: key });
    }

    preload() {
        this.load.image('icon-back', 'assets/icons/left.svg');
    }

    create() {
        this.createTitle('Control 示例');
    }

    public createTitle(title: string) {
        const centerX = this.cameras.main.centerX;
        this.add.text(centerX, 50, title, { fontSize: '32px', color: '#000' }).setOrigin(0.5);

        // 添加返回按钮
        const backButton = new Button(this, 30, 30, '', {
            width: 40,
            height: 40,
            radius: 20,
            bgColor: 0x2ecc71,
        });
        backButton.setIcon('icon-back');
        backButton.on('click', () => { this.scene.start('TestIndex'); });
    }
}