import { GameConfig} from './GameConfig.ts';
import { SceneHelper } from './utils/SceneHelper.js';
import { UIHelper } from './utils/UIHelper.js';
import { Button } from './controls/forms/Button.js';

export class AboutScene extends Phaser.Scene {
    private scrollContainer!: Phaser.GameObjects.Container;

    constructor() {
        super({ key: 'AboutScene' });
    }
    
    preload() {
        this.load.image('arrow-left', 'assets/icons/left.svg');
        this.load.image('code', 'assets/images/code.png');
        this.load.image(GameConfig.icons.back.key, GameConfig.icons.back.path);
    }

    create() {
        // 半透明背景
        this.add.rectangle(
            0, 0,
            this.cameras.main.width, this.cameras.main.height, // window.innerWidth, window.innerHeight,
            0x000000, 0.9
        ).setOrigin(0, 0);

        // 标题
        this.add.text(
            this.cameras.main.width/2,
            10,
            '关于',
            {
                color: '#ffff00',
                fontSize: 52,
                fontFamily: GameConfig.fonts.title,
                shadow: {
                    offsetX: 2,
                    offsetY: 2,
                    color: '#000000',
                    blur: 4,
                    fill: true
                }
            }
        ).setOrigin(0.5, 0);

        // 内容
        this.scrollContainer = UIHelper
            .createScrollContainer(
                this, 
                0, 
                150, 
                this.cameras.main.width, 
                this.cameras.main.height, 
                this.cameras.main.height*2
            )
            .setDepth(GameConfig.depths.popup)
            ;
        //var code = this.add.image((this.cameras.main.width-400)/2, 10, 'code')
        //    .setOrigin(0, 0)
        //    .setSize(400, 400)
        //    .setDepth(GameConfig.depths.top)
        //    ;
        var txt = this.add.text(
            this.cameras.main.width/2,
            50,
            [
                '单词连连看',
                '版本：1.0.0',
                '',
                '作者：程建和',
                '联系：微信 surfsky',
                '版权所有 © 2025',
            ].join('\n'),
            {
                fontSize: 24,
                color: '#ffffff',
                fontFamily: GameConfig.fonts.default,
                align: 'center',
                lineSpacing: 20,
                wordWrap: {
                    width: this.cameras.main.width - 40,
                    useAdvancedWrap: true
                },
                padding: {
                    x: 20,
                    y: 20
                }
            }
        ).setOrigin(0.5, 0);
        this.scrollContainer.add([txt]);

        // 返回按钮
        new Button(this, 60, 40, '', { width: 60, height: 60, radius:30, bgColor: GameConfig.colors.contrast })
            .setIcon(GameConfig.icons.back.key, 1.5)
            .setAnimate()
            .onClick(() => SceneHelper.goScene(this, 'StudyWelcomeScene'))
            ;
    }
}
