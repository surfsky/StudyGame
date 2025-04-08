import Phaser from 'phaser';
import { TestScene } from './TestScene';
import { CheckBox } from '../controls/forms/CheckBox';
import { Switcher } from '../controls/forms/Switcher';
import { RadioBox } from '../controls/forms/RadioBox';
import { GroupButton } from '../controls/forms/GroupButton';
import { Label } from '../controls/basic/Label';

/**测试基础控件场景 */
export class TestFormBasic extends TestScene {
    constructor() {
        super('TestFormBasic');
    }

    create() {
        this.createTitle('Control 示例');

        // 画一条基准线
        var g = this.add.graphics();
        g.lineStyle(1, 0xa0a0a0);
        g.strokeLineShape(new Phaser.Geom.Line(100, 0, 100, this.game.canvas.height));

        // 复选框
        new CheckBox(this, 100, 100, 200, 20, '复选框', true);
        new Switcher(this, 100, 200).showBounds(true);

        // 单选框组1
        new RadioBox(this, 100, 300, 200, 20, '选项1', 'group1', true);
        new RadioBox(this, 350, 300, 200, 20, '选项2', 'group1', false);
        new RadioBox(this, 600, 300, 200, 20, '选项3', 'group1', false);

        // 单选框组2
        new RadioBox(this, 100, 350, 200, 20, '类型A', 'group2', true);
        new RadioBox(this, 350, 350, 200, 20, '类型B', 'group2', false);

        // Label示例
        new Label(this, 100, 450, '普通文本').setStyle('normal');
        new Label(this, 100, 500, '小号文本').setStyle('small');
        new Label(this, 100, 550, '一级标题').setStyle('h1');
        new Label(this, 100, 600, '二级标题').setStyle('h2');
        new Label(this, 100, 650, '三级标题').setStyle('h3');
        new Label(this, 100, 700, '四级标题').setStyle('h4');
        new Label(this, 100, 750, '五级标题').setStyle('h5');

        // GroupButton示例
        const groupBtn1 = new GroupButton(this, 100, 800, 300, 40, ['选项A', '选项B', '选项C']);
        groupBtn1.on('changed', (index: number, item: string) => {
            console.log(`选中了选项: ${item}`);
        });

        const groupBtn2 = new GroupButton(this, 100, 850, 400, 40, ['简单', '普通', '困难', '地狱']);
        groupBtn2.setSelectedIndex(1);
    }
}