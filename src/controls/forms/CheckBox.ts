import Phaser from 'phaser';
import { Control } from '../Control';
import { RectShape } from '../RectShape';
import { GameConfig } from '../../GameConfig';

/*********************************************************
 * CheckBox 控件
 * @example 
 * var cb = new CheckBox(scene, 0, 0, '测试', true).onChanged(() => {console.log('checked')});
 * var v = cb.getValue();
 *********************************************************/
export class CheckBox extends Control {
    private checked: boolean;
    private text: string;
    private label?: Phaser.GameObjects.Text;
    private changedCallback?: ()=>{};

    /**获取选中状态*/
    getValue(){
        return this.checked;
    }
    setValue(value: boolean){
        this.checked = value;
        this.drawCheckBox(this.scene, this.text, this.checked);
        return this;
    }

    /**
     * 按钮文本
     */

    /**
     * 创建按钮
     * @param scene 场景实例
     * @param x 按钮x坐标
     * @param y 按钮y坐标
     * @param text 按钮文本
     */
    constructor(scene: Phaser.Scene, x: number, y: number, w:number, h:number, text: string, checked:boolean) {
        super(scene, x, y);
        this.setSize(w, h);
        this.checked = checked;
        this.text = text;
        this.draw();
        this.setEvents();
        return this;
    }

    /**绘制 */
    protected override draw(){
        super.draw();
        this.drawCheckBox(this.scene, this.text, this.checked);
    }

    /**绘制 */
    drawCheckBox(scene:Phaser.Scene, text: string, checked:boolean, d:number=20) {
        var g = this.graphics;
        this.add(g);

        // 矩形外框
        g.fillStyle(0xffffff, 1);
        g.fillRect(0, 0, d, d);
        g.lineStyle(1, 0x000000, 1);
        g.strokeRect(0, 0, d, d);

        // 内实心矩形
        if (checked){
            g.fillStyle(0x34c759, 1);
            g.fillRect(d*0.1, d*0.1, d*0.8, d*0.8);
        }

        // 右侧附上文本
        if (text){
            if (this.label){
                this.label.destroy();
            }
            this.label = scene.add.text(d*1.4, 0, text, {
                fontSize: '24px',
                color: '#000000',
            });
            this.label.setOrigin(0, 0);
            this.add(this.label);
        }
    }


    /**设置事件 */
    private setEvents(){
        this.setInteractive({ 
            cursor: 'pointer', 
            hitArea: new Phaser.Geom.Rectangle(this.width / 2, this.height / 2, this.width, this.height), 
            hitAreaCallback: Phaser.Geom.Rectangle.Contains 
        });
        this.on('pointerdown', () => {
            this.checked = !this.checked;
            this.draw();
            if (this.changedCallback){
                this.changedCallback();
            }
        });
    }

    /**设置值变更事件 */
    public onChanged(callback: ()=>{}){
        this.changedCallback = callback;
        return this;
    }
}