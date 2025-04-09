import { GameConfig} from './GameConfig.ts';
import { SceneHelper } from './utils/SceneHelper.js';
import { UIHelper } from './utils/UIHelper.js';
import { Button } from './controls/buttons/Button.js';
import { Panel } from './controls/Panel.js';
import { ThemeManager } from './controls/Theme.ts';

export class AboutScene extends Phaser.Scene {
    private scrollPanel!: Panel; // Phaser.GameObjects.Container;

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
        //this.add.rectangle(
        //    0, 0,
        //    this.cameras.main.width, this.cameras.main.height, // window.innerWidth, window.innerHeight,
        //    0x000000, 0.9
        //).setOrigin(0, 0);
        SceneHelper.setBgColor(this, 0x000000);

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
        this.scrollPanel = new Panel(this, 0, 150, this.game.canvas.width, this.game.canvas.height, this.game.canvas.height*2, 0, 0x000000);
        //UIHelper
        //    .createScrollContainer(
        //        this, 
        //        0, 
        //        150, 
        //        this.cameras.main.width, 
        //        this.cameras.main.height, 
        //        this.cameras.main.height*2
        //    )
        //    .setDepth(GameConfig.depths.popup)
        //    ;
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
                `## 功能
                - 手机竖屏版本的单词学习游戏。
                - 用户群体为儿童，界面和声效都要有趣一些。
                - 欢迎场景显示背景图片、游戏标题，显示“关卡选择”、“开始”、“错题复习”、“重置”按钮。
                - 主游戏场景
                  - 顶部为工具栏，左边为返回按钮，右边为刷新按钮
                  - 左侧为一批英语单词，外观为胶囊型，点击可朗读。
                  - 右侧为一批对应的中文，外观为胶囊型，点击可朗读。
                  - 右侧中文顺序是打乱的。
                  - 按住左侧单词，可连线拖动到右侧中文，若匹配成功则闪烁并消除这一对中英文词汇（并播放消除声效），若连线错误则播放嘟嘟声音。
                  - 该关卡单词全部匹配成功后，播放音乐，继续下一关。
                - 特点
                  - 每个单词都有以下属性：ID、英文、中文、词根、音标、主题
                  - 关卡数据从excel导入，可自定义关卡。
                  - 主游戏场景有：学习模式、游戏模式、错题复习模式。
                    - 学习模式：左右单词对称，用户可通过拖拽连线的方式来匹配单词。
                    - 游戏模式：左右单词不对称，用户可通过拖拽连线的方式来匹配单词。
                    - 错题复习模式：用户可通过拖拽连线的方式来匹配单词，匹配成功后会被消除。
                  - 单词的排序方式有：字母顺序、随机、词根、原序。更方便批量主题方式背诵。
                  - 单词卡详细信息从 AI 获取（英文、中文、音标、词根、词性、例句、翻译、图片、音频）`
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
        this.scrollPanel.add([txt]);
        this.scrollPanel.resetContentHeight();

        // 返回按钮
        new Button(this, 60, 40, '', { width: 60, height: 60, radius:30, bgColor: GameConfig.colors.contrast })
            .setIcon(GameConfig.icons.back.key, 1.5)
            .setAnimate()
            .onClick(() => SceneHelper.goScene(this, 'StudyWelcomeScene'))
            ;
    }
}
