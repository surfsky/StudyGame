import Phaser from 'phaser';
import { TestScene } from './TestScene';
import { CheckBox } from '../controls/forms/CheckBox';
import { Switcher } from '../controls/forms/Switcher';


/**测试基础控件场景 */
export class TestFormBasic extends TestScene {
    constructor() {
        super('TestFormBasic');
    }

    create() {
        this.createTitle('Control 示例');
        var chk = new CheckBox(this, 100, 100, 200, 20, '测试', true).showBounds(true);
        var switcher = new Switcher(this, 100, 200).showBounds(true);
    }
}