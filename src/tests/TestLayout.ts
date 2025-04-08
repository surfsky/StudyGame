import 'phaser';
import { Row } from '../controls/layouts/Row';
import { Grid } from '../controls/layouts/Grid';
import { Column } from '../controls/layouts/Column';
import { TestScene } from './TestScene';

export class TestLayout extends TestScene {
    constructor() {
        super('TestLayout');
    }

    preload() {
        // 预加载背景图
        this.load.image('sky', 'assets/images/bg1.png');
    }

    create() {
        this.createTitle("Layout");
        
        // 设置背景
        //this.add.image(400, 300, 'sky');

        // 测试Row布局
        this.testRow();

        // 测试Column布局
        this.testColumn();

        // 测试Grid布局
        this.testGrid();
    }

    private testRow() {
        var p = 10;
        var w = this.game.canvas.width;
        var centerX = this.cameras.main.width / 2;

        // 创建一个Row容器，设置固定宽度和autoWrap
        const row = new Row(this, 10, 100, w-20, 200, 5, true);
        row.setOrigin(0, 0);
        row.setFillStyle(0x00ff00, 0.5);

        // 添加更多测试项来测试自动换行
        for (let i = 0; i < 20; i++) {
            const item = this.add.rectangle(0, 0, 20, 20, 0xff0000).setOrigin(0);;
            row.addChild(item);
        }
    }

    private testColumn() {
        var p = 10;
        var w = this.game.canvas.width;
        const column = new Column(this, p, 200, 100, 400, 10, true);
        column.setOrigin(0, 0);
        column.setFillStyle(0x00ff00, 0.5);

        // 添加测试项来测试自动换列
        for (let i = 0; i < 20; i++) {
            const item = this.add.rectangle(0, 0, 20, 20, 0xff0000).setOrigin(0);
            column.addChild(item);
        }
    }



    private testGrid() {
        // 创建一个Grid容器
        const grid = new Grid(this, 200, 300, {
            columnCount: 3,
            cellWidth: 50,
            cellHeight: 50,
            horizontalSpacing: 10,
            verticalSpacing: 10,
            horizontalAlignment: 'center',
            verticalAlignment: 'center'
        });

        // 添加一些测试项
        const items = Array(9).fill(null).map((_, i) => 
            this.add.rectangle(0, 0, 50, 50, i % 3 === 0 ? 0xff0000 : i % 3 === 1 ? 0x0000ff : 0x00ff00)
        );
        grid.addContent(items);
    }
}
