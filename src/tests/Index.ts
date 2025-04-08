import Phaser from 'phaser';
import { GameConfig } from '../GameConfig';
import { MessageBox } from '../controls/overlays/MessageBox';
import { Button } from '../controls/forms/Button';
import { TestBlock } from './TestBlock';
import { TestLayout } from './TestLayout';
import { TestInput } from './TestInput';
import { TestButton } from './TestButton';
import { TestTTS } from './TestTTS';
import { TestExcel } from './TestExcel';
import { TestControls } from './TestControls';
import { TestFormBasic } from './TestFormBasic';
import { TestPopup } from './TestPopup';
import { TestTooltip } from './TestTooltip';
import { TestTag } from './TestTag';
import { TestImage } from './TestImage';
import { TestDrag } from './TestDrag';
import { TestResize } from './TestResize';
import { TestTable } from './TestTable';
import { TestScene } from './TestScene';
import { TestView } from './TestView';

/**测试场景列表 */
export class Index extends Phaser.Scene {
    constructor() {
        super({ key: 'TestIndex' });
    }

    preload() {
        // 预加载资源
        this.load.image(GameConfig.icons.back.key, GameConfig.icons.back.path); //'icon-back', 'assets/icons/left.svg');
        this.load.image(GameConfig.icons.down.key, GameConfig.icons.down.path);
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
            { key: 'TestFormBasic', title: '基本表单控件' },
            { key: 'TestInput', title: '输入控件' },
            { key: 'TestLayout', title: '布局' },
            { key: 'TestBlock', title: 'BLOCK' },
            { key: 'TestTTS', title: 'TTS' },
            { key: 'TestExcel', title: 'Excel导入' },
            { key: 'TestControls', title: 'Controls' },
            { key: 'TestPopup', title: 'Popup' },
            { key: 'TestTooltip', title: 'Tooltip' },
            { key: 'TestTag', title: 'Tag' },
            { key: 'TestImage', title: 'Image' },
            { key: 'TestDrag', title: 'Drag' },
            { key: 'TestResize', title: 'Resize' },
            { key: 'TestTable', title: 'Table' },
            { key: 'TestView', title: '视图' },
        ];

        // 创建场景按钮（两列布局）
        const columnWidth = 220; // 列宽（包含按钮间距）
        scenes.forEach((scene, index) => {
            const column = index % 2; // 0为左列，1为右列
            const row = Math.floor(index / 2); // 计算行数
            const x = centerX + (column === 0 ? -columnWidth/2 : columnWidth/2);
            const y = 150 + row * 80;
            
            const button = new Button(this, x, y, scene.title, {
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
    scene: [Index, MessageBox, 
        TestBlock, TestLayout, TestInput, TestButton, 
        TestTTS, TestExcel, TestControls, TestFormBasic, 
        TestPopup, TestTooltip, TestTag, TestImage,
        TestDrag, TestResize, TestTable, TestScene,
        TestView
    ],
    backgroundColor: '#ffffff'
};

const game = new Phaser.Game(config);

// 监听窗口大小变化
window.addEventListener('resize', () => {
    game.scale.refresh();
});