import { Scene } from 'phaser';
import { GameConfig } from '../../GameConfig';
import { Panel } from '../Panel';

export interface DropDownListOptions {
    x: number;
    y: number;
    width?: number;
    height?: number;
    dropWidth?: number; // 下拉框的宽度，默认为与背景相同的宽度
    dropHeight?: number; // 下拉框的高度，默认为与背景相同的高度
    values: string[];
    fontSize?: string;
    textColor?: string;
    backgroundColor?: number;
    hoverColor?: string;
    selectedColor?: string;
    borderRadius?: number;
    iconKey?: string;
    onChange?: (selectedIndex: number, selectedValue: string) => void;
}

/**
 * Dropdown list
 */
export class DropDownList {
    private scene: Scene;
    public container!: Phaser.GameObjects.Container;
    private selectedText!: Phaser.GameObjects.Text;
    private itemContainer: Phaser.GameObjects.Container | null = null;
    private icon!: Phaser.GameObjects.Image;
    public isOpen: boolean = false;
    private selectedIndex: number = 0;
    private items: string[] = [];
    private options: Required<DropDownListOptions>;
    private eventBlocker: Phaser.GameObjects.Rectangle | null = null;

    constructor(scene: Scene, options: DropDownListOptions) {
        this.scene = scene;
        this.options = {
            x: options.x,
            y: options.y,
            width: options.width || 200,
            height: options.height || 400,
            dropWidth: options.dropWidth || 200,
            dropHeight: options.dropHeight || 400,
            values: options.values,
            fontSize: options.fontSize || '28px',
            textColor: options.textColor || '#ffffff',
            backgroundColor: options.backgroundColor || 0xff0000,
            hoverColor: options.hoverColor || '#ffff00',
            selectedColor: options.selectedColor || '#ffff00',
            borderRadius: options.borderRadius || 10,
            iconKey: options.iconKey || GameConfig.icons.down.key,
            onChange: options.onChange || (() => {})
        };
        if (this.options.dropHeight < this.options.height) {
            this.options.dropHeight = this.options.height;
        }
        this.items = options.values;
        this.createDropdown();
    }

    /**创建下拉框 */
    private createDropdown() {
        this.container = this.scene.add.container(this.options.x, this.options.y);

        // 创建下拉框背景
        const bg = this.scene.add.graphics();
        bg.fillStyle(this.options.backgroundColor, 1);
        bg.fillRoundedRect(
            -this.options.width/2,
            -this.options.height/2,
            this.options.width,
            this.options.height,
            this.options.borderRadius
        );

        // 创建选中文本
        this.selectedText = this.scene.add.text(
            0,
            0,
            this.items[this.selectedIndex],
            {
                fontSize: this.options.fontSize,
                color: this.options.textColor
            }
        ).setOrigin(0.5);

        // 添加下箭头图标
        this.icon = this.scene.add.image(this.options.width/2 - 20, 0, this.options.iconKey)
            .setScale(0.8)
            .setTint(0xffffff);

        // 将元素添加到容器
        this.container.add([bg, this.selectedText, this.icon]);

        // 设置容器为可交互
        this.container.setSize(this.options.width, this.options.height);
        this.container.setInteractive({ useHandCursor: true });
        this.container.on('pointerdown', (pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) => {
            event.stopPropagation();
            if (this.isOpen) {
                this.closeDropdown();
            } else {
                this.openDropdown();
            }
        });

        // 添加全局点击事件监听器
        //this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        //    if (this.isOpen && this.itemContainer) {
        //        const bounds = this.itemContainer.getBounds();
        //        const containerBounds = this.container.getBounds();
        //        if (!Phaser.Geom.Rectangle.Contains(bounds, pointer.x, pointer.y) &&
        //            !Phaser.Geom.Rectangle.Contains(containerBounds, pointer.x, pointer.y)) {
        //            this.closeDropdown();
        //        }
        //    }
        //});
    }

    //-----------------------------------------------
    // 下拉框
    //-----------------------------------------------
    /**弹出选项层 */
    private openDropdown() {
        if (this.isOpen) return;
        this.isOpen = true;

        // 旋转箭头图标
        this.scene.tweens.add({
            targets: this.icon,
            angle: 180,
            duration: 200,
            ease: 'Power2'
        });

        // 创建选项弹出层
        var ox = this.options.x - this.options.dropWidth/2;
        var oy = this.options.y + this.options.height/2 + 2;
        var contentHeight = this.items.length * 40 + 40;
        if (contentHeight < this.options.dropHeight) {
            this.options.dropHeight = contentHeight;
        }
        this.itemContainer = new Panel(this.scene, ox, oy, this.options.dropWidth, this.options.dropHeight, contentHeight, this.options.borderRadius);
        this.itemContainer.setDepth(99);
        //this.itemContainer.setInteractive();

        // 创建选项
        this.items.forEach((item, index) => {
            const itemText = this.scene.add.text(
                this.options.dropWidth/2,
                index * 40 + 25,
                item,
                {
                    fontSize: this.options.fontSize,
                    color: index === this.selectedIndex ? this.options.selectedColor : this.options.textColor
                }
            ).setOrigin(0.5);

            itemText.setInteractive();
            itemText.on('pointerover', () => {itemText.setColor(this.options.hoverColor);});
            itemText.on('pointerout',  () => {itemText.setColor(index === this.selectedIndex ? this.options.selectedColor : this.options.textColor);});
            itemText.on('pointerdown', () => {this.setSelectedIndex(index);});
            this.itemContainer!.add(itemText);
        });
    }

    /**关闭下拉框弹出层 */
    private closeDropdown() {
        if (!this.isOpen) return;
        this.isOpen = false;

        // 移除事件屏蔽层
        this.eventBlocker?.destroy();
        this.eventBlocker = null;

        // 恢复箭头方向
        this.scene.tweens.add({
            targets: this.icon,
            angle: 0,
            duration: 200,
            ease: 'Power2'
        });

        this.itemContainer?.destroy();
        this.itemContainer = null;
    }

    //--------------------------------------------------
    // 公有方法
    //--------------------------------------------------
    /**获取选中ID */
    public getSelectedIndex(): number {
        return this.selectedIndex;
    }

    /**设置选中ID */
    public setSelectedIndex(index: number) {
        this.selectedIndex = index;
        this.selectedText.setText(this.items[index]);
        this.closeDropdown();
        this.options.onChange(index, this.items[index]);
        if (this.scene.sound) {
            this.scene.sound.play(GameConfig.sounds.click.key);
        }
    }

    /**获取选中值（字符串类型） */
    public getValue(): string {
        return this.items[this.selectedIndex];
    }

    /**设置选中值（字符串类型） */
    public setValue(value: string) {
        const index = this.items.indexOf(value);
        if (index !== -1) {
            this.setSelectedIndex(index);
        }
    }

    /**设置选项 */
    public setItems(values: string[]) {
        this.items = values;
        this.selectedIndex = 0;
        this.selectedText.setText(this.items[0]);
    }

    /**销毁控件 */
    public destroy() {
        this.closeDropdown();
        this.container.destroy();
    }
}