import { GameObjects, Scene } from 'phaser';
import { GameConfig } from '../GameConfig';
import { StudyDoc } from './StudyDoc';
import { SceneHelper } from '../utils/SceneHelper';
import { WordItem } from './WordItem';
import { Level } from './StudyDb';
import { RectShape } from '../controls/RectShape';
import { Button } from '../controls/forms/Button';
import { SortType } from './StudyDb';
import { DropDownList } from '../controls/forms/DropDownList';
import { Switcher } from '../controls/forms/Switcher';


/**
 * 排序选项接口
 */
interface SortOption {
    icon: string;
    text: string;
    value: SortType;
}

/**
 * 学习场景
 */
export class StudyScene extends Scene {
    private levelId = 0;
    private levelName = "";
    private level: Level | null = null;
    private mode : 'all' | 'unlearned' | 'error' = 'all';
    private pageId : number = 0;
    private doc: StudyDoc;
    private leftItems: WordItem[] = [];
    private rightItems: WordItem[] = [];
    private startItem: WordItem | null = null;
    private startPoint: Phaser.Math.Vector2 = new Phaser.Math.Vector2();
    private endPoint: Phaser.Math.Vector2 = new Phaser.Math.Vector2();
    private line: Phaser.GameObjects.Graphics | null = null;
    private statText: Phaser.GameObjects.Text | null = null;

    private btn!: Button;
    private ddl!: DropDownList;
    private switcher!: Switcher;


    //-----------------------------------------------------
    // Scene 标准接口方法
    //-----------------------------------------------------
    /**构造函数 */
    constructor() {
        super({ key: 'StudyScene' });
        this.doc = new StudyDoc();
    }

    /**数据初始化 */
    async init(data: { level:Level, mode: 'all' | 'unlearned' | 'error', pageId:number}) {
        this.level = data.level;
        this.levelId = this.level.levelId;
        this.levelName = this.level.title;
        this.mode = data.mode;
        this.pageId = data.pageId;
        this.doc.onMatchSuccess = async () => {
            this.sound.play(GameConfig.sounds.clear.key);
            console.log("success: ", this.doc.getMatchWord()?.en);
            await this.showStat(); // 更新学习进度显示
        };
        this.doc.onMatchFail = async () => {
            this.sound.play(GameConfig.sounds.error.key);
            await this.showStat(); // 更新学习进度显示
            console.log("fail: ", this.doc.getMatchWord()?.en);
        };
        this.doc.onPageComplete = async () => {
            this.sound.play(GameConfig.sounds.success.key);
            await this.doc.calcPages(); // 更新总页数
            const currentPage = this.doc.getPageId() + 1;
            const totalPages = this.doc.getPages();
            if (currentPage <= totalPages) {
                this.scene.restart({ levelId: this.levelId, levelName:this.levelName, mode: this.mode, pageId:0 });
            }
        };
    }

    /**预加载资源 */
    preload() {
        // 加载图标
        this.load.image(GameConfig.icons.back.key,     GameConfig.icons.back.path);
        this.load.image(GameConfig.icons.left.key,     GameConfig.icons.left.path);
        this.load.image(GameConfig.icons.right.key,    GameConfig.icons.right.path);
        this.load.image(GameConfig.icons.rotate.key,    GameConfig.icons.rotate.path);
        // 加载音效和背景音乐
        this.load.audio(GameConfig.sounds.success.key, GameConfig.sounds.success.path);
        this.load.audio(GameConfig.sounds.error.key,   GameConfig.sounds.error.path);
        this.load.audio(GameConfig.sounds.clear.key,   GameConfig.sounds.clear.path);
        this.load.audio(GameConfig.sounds.bgm.key,     GameConfig.sounds.bgm.path);
        // 加载背景图片
        this.load.image('bg', GameConfig.bgs[0].path);
    }

    /**创建场景UI */
    async create() {
        this.createUI();
        await this.createWordItems();
        await this.showStat();
        this.setupDragSystem();
    }

    
    //-----------------------------------------------------
    // UI
    //-----------------------------------------------------
    createSortDropDown() {
        var items: SortOption[] = [
            { icon: 'sort-raw', text: '原始顺序', value: SortType.Raw },
            { icon: 'sort-alphabet', text: '字母顺序', value: SortType.Alphabet },
            { icon: 'sort-random', text: '随机顺序', value: SortType.Random }
        ];
        this.ddl = new DropDownList(this, {
            x: this.game.canvas.width - 50,
            y: 40,
            width: 40,
            height: 40,
            fontSize: '18px',
            textColor: '#ffffff',
            backgroundColor: GameConfig.colors.contrast,
        });
        this.ddl.setBaseUI((item: SortOption) => {
            const container = new Phaser.GameObjects.Container(this, 0, 0);
            this.btn = new Button(this, 0, 0, "", {
                active: false, 
                width: 30, height:30, radius:0, 
                textColor: '#ffffff',
                bgColor:GameConfig.colors.contrast
            });
            this.btn.setIcon(item.icon, 1.4);
            //this.btn.setText(item.text);
            container.add(this.btn);
            return container;
        });
        this.ddl.setBaseUIOnShow((item: SortOption) => {
            this.btn.setIcon(item.icon, 1.4);
            //this.btn.setText(item.text);
        });
        this.ddl.setItemUI((item: SortOption, index:number) => {
            const container = new Phaser.GameObjects.Container(this, 0, 0);
            var btn = new Button(this, 0, 0, "", {
                active: false, 
                width: 150, height:30, radius:0, 
                textColor: '#ffffff',
                bgColor: 0x000000
            });
            btn.setIcon(item.icon, 1.4);
            btn.setText(item.text);
            btn.setSize(100, 40);
            container.add(btn);
            return container;
        });
        this.ddl.onChanged(async (index:number, item: SortOption)=>{
            await this.createWordItems(item.value, !this.switcher.getValue());
        })
        this.ddl.bind(items, 'value', 'text');
        this.ddl.setDepth(999);
    }

    private createUI() {
        this.add.image(0, 0, 'bg')
            .setOrigin(0)
            .setDisplaySize(this.game.canvas.width, this.game.canvas.height)
            .setDepth(-1);
        new RectShape(this, 0, 0, this.game.canvas.width, this.game.canvas.height, 0, 0x000000, 0.5);

        // 返回按钮
        new Button(this, 60, 40, '', { width: 60, height: 60, radius:30, bgColor: GameConfig.colors.contrast })
            .setIcon(GameConfig.icons.back.key, 1.5)
            .onClick(() => SceneHelper.goScene(this, 'StudyWelcomeScene', {levelId: this.levelId}))
            ;


        // 排序按钮
        this.createSortDropDown();


        //--------------------------------------------
        // text
        //--------------------------------------------
        const modeText = {
            'all': '全部单词',
            'unlearned': '未学单词',
            'error': '错误单词'
        };
                
        // 创建等级文本
        const levelText = `${this.levelName}\n${modeText[this.mode]}`;
        this.add.text(
            this.game.canvas.width/2,
            40,
            levelText,
            {
                fontSize: '22px',
                color: '#ffffff',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 1,
                align: 'center'
            }
        ).setOrigin(0.5);


        // 游戏提示信息
        this.add.text(
            this.game.canvas.width / 2,
            this.game.canvas.height - 30,
            `请连接匹配的中英文词语`,
            {
                fontSize: '18px',
                color: '#ffffff',
            }
        ).setOrigin(0.5).setAlpha(0.5);

        // 进度信息
        this.statText = this.add.text(
            this.game.canvas.width/2,
            this.game.canvas.height - 60,
            '0/0',
            {
                fontSize: '18px',
                color: '#ffff00',
            }
        ).setOrigin(0.5);

        // 底部放一个学习开关按钮
        this.switcher = new Switcher(this, this.game.canvas.width-75, this.game.canvas.height - 60);
        this.switcher.on('change', (value: boolean) => {
            this.createWordItems(this.ddl.getSelectedValue(), !this.switcher.getValue());
        });
    }


    /**更新学习进度统计信息 */
    private async showStat() {
        var status = await this.doc.getStat();
        var txt = `对${status.learned}错${status.error}余${status.total}`;
        this.statText!.setText(txt);
    } 

    //--------------------------------------------
    // 主游戏页面
    //--------------------------------------------
    /**创建左侧的英文单词容器 */
    private async createWordItems(sortType: SortType = SortType.Raw, shuffle: boolean=true) {
        // 根据屏幕高度计算每页可显示的单词数量
        const screenHeight = this.game.canvas.height;
        const startY = 150; // 单词起始Y坐标
        const bottomPadding = 30; // 底部留白
        const itemHeight = 50;
        const spacing = itemHeight + 20; // 单词间距
        var pageSize = Math.floor((screenHeight - startY - bottomPadding) / spacing);
        const screenWidth = this.game.canvas.width;
        const margin = 20; // 左右边距
        const centerGap = Math.max(screenWidth * 0.1, 50); // 中间区域宽度
        const itemWidth = Math.min(Math.max((screenWidth - margin*2 - centerGap)/2, 120), 400); // 根据屏幕宽度计算，但不超过最大值
        console.log(`StudyScene.createWordItems: 排序方式=${sortType}, 页大小=${pageSize}, 页码=${this.pageId}`);

        // 清除现有单词项
        this.leftItems.forEach(item => item.destroy());
        this.rightItems.forEach(item => item.destroy());
        this.leftItems = [];
        this.rightItems = [];

        // 初始化关卡数据
        await this.doc.init(this.levelId, this.mode, sortType, pageSize, this.pageId);
        const enWords = this.doc.getEnWords();
        const cnWords = this.doc.getCnWords(shuffle);
        console.log(`StudyScene.createWordItems: 获取到英文单词=${enWords.length}, 中文单词=${cnWords.length}`);
        
        // 如果没有单词数据，显示提示信息
        if (enWords.length === 0 || cnWords.length === 0) {
            this.add.text(
                this.game.canvas.width / 2,
                this.game.canvas.height / 2,
                `没有要学的单词啰～`,
                {
                    fontSize: '24px',
                    color: '#ffffff',
                    //backgroundColor: '#ff0000',
                    padding: { x: 20, y: 10 }
                }
            ).setOrigin(0.5);
            return;
        }


        // 创建英中文单词控件
        enWords.forEach((word, index) => {
            const enItem = new WordItem(this, word, 'en', word.en, margin+itemWidth/2, startY + index * spacing, itemWidth, itemHeight);
            this.leftItems.push(enItem);
        });
        cnWords.forEach((word, index) => {
            // 创建中文单词控件
            const cnItem = new WordItem(this, word, 'cn', word.cn, screenWidth - margin-itemWidth/2, startY + index * spacing, itemWidth, itemHeight);
            this.rightItems.push(cnItem);
        });
    }


    //-----------------------------------------------------
    // Drag line logic
    //-----------------------------------------------------
    /**设置拖拽连线逻辑 */
    private setupDragSystem() {
        // 按下绘制item外框、设置连线开始点
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer, targets: Phaser.GameObjects.GameObject[]) => {
            const item = targets[0];  // as WordItem;  // todo: 如何判断 item 是 WordItem 类型？
            if (item instanceof WordItem) {
                this.startItem = item;
                this.line = this.add.graphics().setDepth(GameConfig.depths.bg + 1);

                // 按下时开始记录起始点并创建线段对象
                const bounds = item.getBounds(); 
                if (this.leftItems.includes(item))
                    this.startPoint.set(bounds.right, bounds.centerY);
                else
                    this.startPoint.set(bounds.left, bounds.centerY);
                
                // 给当前item添加红色边框
                this.leftItems.forEach(item => {item.setHighlight(false);});
                this.rightItems.forEach(item => {item.setHighlight(false);});
                item.setHighlight(true);  // debug fail：item.setHighlight is not a function
            }
        });

        // 移动时绘制连线、目标item的外框
        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (this.startItem && this.line) {
                // 寻找最近的目标元素并绘制线段
                const items = this.startItem.isEn() ? this.rightItems : this.leftItems;
                let endItem = this.FindEndItem(items, pointer);
                this.drawLine();

                // 更新所有目标容器的高亮状态
                items.forEach(item => item.setHighlight(false));
                if (endItem != null) 
                    (endItem as WordItem).setHighlight(true);
            }
        });

        // 松开时销毁连线、外框，若连线匹配则销毁item
        this.input.on('pointerup', async (pointer: Phaser.Input.Pointer) => {
            if (this.startItem && this.line) {
                // 寻找最近的目标元素
                const items = this.startItem.isEn() ? this.rightItems : this.leftItems;
                let endItem = this.FindEndItem(items, pointer);
                if (endItem) {
                    // 检测单词中英文是否匹配
                    const enWord = this.startItem.isEn() ? this.startItem.getText() : endItem.getText();
                    const cnWord = this.startItem.isEn() ? endItem.getText() : this.startItem.getText();
                    const isMatch = await this.doc.checkMatch(enWord, cnWord);
                    if (isMatch && endItem) {
                        // 若匹配则消除两个item
                        this.leftItems  = this.leftItems.filter(c => c !== this.startItem && c !== endItem);
                        this.rightItems = this.rightItems.filter(c => c !== this.startItem && c !== endItem);
                        this.startItem.destroy();
                        endItem.destroy();
                    }
                }

                // 清除线段对象
                //this.line.setVisible(false);
                this.line.destroy();
                this.line = null;
                this.startItem = null;
            }
        });
    }



    /**尝试找到终点节点并设置线段终点 */
    private FindEndItem(items: WordItem[], pointer: Phaser.Input.Pointer) : WordItem | null  {
        if (this.startItem == null) 
            return null;
        this.endPoint = new Phaser.Math.Vector2(pointer.x, pointer.y);
        let hoverItem: WordItem | null = null;
        items.forEach(item => {
            const bounds = item.getBounds();
            if (pointer.x >= bounds.left && pointer.x <= bounds.right && 
                pointer.y >= bounds.top && pointer.y <= bounds.bottom) {
                hoverItem = item;
                // 设置连线的终点为 WordItem 的左边或右边中点
                const centerX = this.startItem!.isEn() ? bounds.left : bounds.right;
                this.endPoint.set(centerX, bounds.centerY);
            }
        });
        return hoverItem;
    }

    /**绘制连线 */
    private drawLine() {
        if (this.line == null) return;
        this.line.setDepth(0);
        this.line.clear();
        this.line.lineStyle(3, 0xff0000);
        this.line.beginPath();
        
        // 设置连线的起点为左侧单词的右边中点，终点为右侧单词的左边中点
        const bounds = this.startItem!.getBounds();
        const startX = this.startItem!.isEn() ? bounds.right : bounds.left;
        this.startPoint.set(startX, bounds.centerY);
        
        // 计算三次贝塞尔曲线的控制点
        const distance = Math.abs(this.endPoint.x - this.startPoint.x);
        const cp1x = this.startPoint.x + distance * 0.5;
        const cp1y = this.startPoint.y - distance * 0;
        const cp2x = this.endPoint.x - distance * 0.5;
        const cp2y = this.endPoint.y + distance * 0;
        
        // 使用多个线段模拟贝塞尔曲线
        this.line.moveTo(this.startPoint.x, this.startPoint.y);
        const segments = 20; // 线段数量
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const x = Math.pow(1-t, 3) * this.startPoint.x + 
                      3 * Math.pow(1-t, 2) * t * cp1x + 
                      3 * (1-t) * Math.pow(t, 2) * cp2x + 
                      Math.pow(t, 3) * this.endPoint.x;
            const y = Math.pow(1-t, 3) * this.startPoint.y + 
                      3 * Math.pow(1-t, 2) * t * cp1y + 
                      3 * (1-t) * Math.pow(t, 2) * cp2y + 
                      Math.pow(t, 3) * this.endPoint.y;
            this.line.lineTo(x, y);
        }
        this.line.strokePath();
        
        // 在连线两端绘制圆点
        const radius = 4;
        this.line.fillStyle(0xff0000, 1);
        this.line.lineStyle(0xff0000, 1);
        this.line.fillCircle(this.startPoint.x, this.startPoint.y, radius);
        this.line.fillCircle(this.endPoint.x, this.endPoint.y, radius);
    }

    
}

