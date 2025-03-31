import { Scene } from 'phaser';
import { GameConfig } from '../GameConfig';
import { SceneHelper } from '../utils/SceneHelper';
import { StudyDb } from './StudyDb';
import { DropDownList } from '../controls/forms/DropDownList';
import { Level } from './StudyDb';
import { MessageBox} from '../controls/overlays/MessageBox';
import { ImportDialog } from './ImportDialog';
import { DialogResult } from '../controls/overlays/DialogResult';
import { Button } from '../controls/forms/Button';
import { Dialog } from '../controls/overlays/Dialog';

/**
 * 欢迎界面
 */
export class StudyWelcomeScene extends Scene {
    private isMuted: boolean = false;
    private levelId: number = 0;
    private levelDropdown?: DropDownList | null;
    private importDialog?: ImportDialog;

    constructor() {
        super({ key: 'StudyWelcomeScene' });
    }
    
    /**数据初始化 */
    async init(data: { levelId?: number}) {
        this.levelId = data.levelId || 0;
    }

    preload() {
        SceneHelper.showLoading(this);
        
        // 加载背景图和音乐
        GameConfig.bgs.forEach(bg => { this.load.image(bg.key, bg.path); });
        this.load.audio(GameConfig.sounds.bgm.key, GameConfig.sounds.bgm.path);
        this.load.audio(GameConfig.sounds.click.key, GameConfig.sounds.click.path);
        this.load.image(GameConfig.icons.volume.key, GameConfig.icons.volume.path);
        this.load.image(GameConfig.icons.down.key, GameConfig.icons.down.path);
        this.load.image('sort-raw',      'assets/icons/sort-raw.svg');
        this.load.image('sort-alphabet', 'assets/icons/sort-alphabet.svg');
        this.load.image('sort-random',   'assets/icons/sort-random.svg');
    }

    async create() {
        // 检查并初始化数据库
        const db = StudyDb.getInstance();
        const exists = await db.checkDatabaseExists();
        if (!exists) {
            try {
                await db.initDatabase('assets/levels/words.xlsx');  // config.json
                await MessageBox.show(this, "初始化数据库", "首次登陆需要初始化单词数据库", false);
                window.location.reload();
            } catch (error) {
                console.error('初始化数据库失败:', error);
                await MessageBox.show(this, "初始化失败", "无法加载单词数据，请确保words.xlsx文件存在", false);
            }
        }
        else{
            await this.createUI();
        }
    }

    /**创建UI组件 */
    private async createUI() {
        // 设置背景图
        this.add.image(0, 0, GameConfig.bgs[0].key)
            .setOrigin(0)
            .setDisplaySize(this.game.canvas.width, this.game.canvas.height)
            .setDepth(-1);

        // 创建音量控制按钮
        this.createVolumnButton();
        this.sound.play(GameConfig.sounds.bgm.key, { loop: true, volume: 0.5 });

        // 创建标题
        this.add.text(
            this.game.canvas.width / 2,
            150,
            '单词连连看',
            {
                fontFamily: GameConfig.fonts.title,
                fontSize: '60px',
                color: '#ffffff',
                stroke: '#ffff00',
                shadow: { blur: 4, color: '#000000', fill: true }
            }
        ).setOrigin(0.5);

        // 创建版权信息
        this.add.text(
            this.game.canvas.width / 2,
            this.game.canvas.height - 30,
            'surfsky@189.cn\rCopyright 2025',
            {
                fontSize: '14px',
                color: '#ffffff',
            }
        ).setOrigin(0.5).setInteractive().on('pointerdown', () => {
            this.sound.stopByKey(GameConfig.sounds.bgm.key);
            SceneHelper.goScene(this, 'AboutScene');
        });

        // 创建游戏按钮和音量控制
        this.levelDropdown = new DropDownList(this, {
            x: this.game.canvas.width / 2,
            y: this.game.canvas.height / 2 - 120,
            width: 200,
            height: 60,
            dropWidth: 300,
            dropHeight: 500,
            fontSize: '28px',
            backgroundColor: 0xff0000,
        }).onChanged(() => this.sound.play(GameConfig.sounds.click.key))
        .setDepth(GameConfig.depths.ui)
        ;
        await this.showLevels();
        this.createGameButtons();

        // 创建导入对话框
        this.importDialog = new ImportDialog(this);
        this.importDialog.onClose(async (result: DialogResult) => {
            if (result === DialogResult.Ok) {
                await this.showLevels();
            }
        });
    }


    /**创建音量控制按钮 */
    private createVolumnButton() {
        const volumeButton = this.add.image(this.game.canvas.width - 50, 50, GameConfig.icons.volume.key).setInteractive();
        volumeButton.setScale(1);
        volumeButton.setDepth(GameConfig.depths.ui);
        volumeButton.on('pointerdown', () => {
            this.isMuted = !this.isMuted;
            this.sound.mute = this.isMuted;
            volumeButton.setAlpha(this.isMuted ? 0.5 : 1);
        });
    }

    /**重新获取关卡信息 */
    private async showLevels() {
        var levels = await StudyDb.getInstance().getLevels();
        this.levelDropdown?.bind(levels, 'levelId', 'title');
        this.levelDropdown?.setSelectedValue(this.levelId);
    }

    /**创建游戏按钮 */
    private async createGameButtons() {
        const buttonY = this.game.canvas.height / 2 - 40;
        const buttonSpacing = 80;

        // 学习按钮
        new Button(this, this.game.canvas.width / 2, buttonY, '学习', {width: 200, height: 60, radius: 30, fontSize: '28px', bgColor: 0x4a90e2})
            .setAnimate()
            .onClick(() => this.startGame('unlearned'))
            ;

        // 复习错词按钮
        new Button(this, this.game.canvas.width / 2, buttonY + buttonSpacing, '错词', {width: 200, height: 60, radius: 30, fontSize: '28px', bgColor: 0xe6a23c})
           .onClick(() => this.startGame('error'))
            ;

        // 全新开始按钮
        new Button(this, this.game.canvas.width / 2, buttonY + buttonSpacing * 2, '重置', {width: 200, height: 60, radius: 30, fontSize: '28px', bgColor: 0x90be6d})
            .onClick(async () => {
                var result = await MessageBox.show(this, "确认重置", "该操作将重置所有学习记录，确认继续吗？", true);
                if (result === DialogResult.Ok) {
                    await StudyDb.getInstance().resetDb();

                    //await new Dialog(this, "单词库已重新设置，可重新开始学习").show();
                    result = await MessageBox.show(this, "重置成功", "单词库已重新设置，可重新开始学习", false);
                    if (result == DialogResult.Ok) {
                        //window.location.reload();
                        await this.showLevels();
                    }
                }
            });

        // 导入单词表按钮
        new Button(this, this.game.canvas.width / 2, buttonY + buttonSpacing * 3, '导入', {width: 200, height: 60, radius: 30, fontSize: '28px', bgColor: 0x8e44ad})
            .onClick(async () => {
                if (DialogResult.Ok == await new ImportDialog(this).show())
                    await this.showLevels();
            })
    }

    /**开始游戏 */
    private async startGame(mode: 'all' | 'unlearned' | 'error') {
        this.sound.stopByKey(GameConfig.sounds.bgm.key);
        var level = this.levelDropdown?.getSelectedItem() as Level;
        SceneHelper.goScene(this, 'StudyScene', {level: level, mode: mode, pageId: 0});
    }
}