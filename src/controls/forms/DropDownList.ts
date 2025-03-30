import { Scene } from 'phaser';
import { GameConfig } from '../../GameConfig';
import { Panel } from '../Panel';
import { Mask } from '../overlays/Mask';

export interface DropDownListOptions {
    x: number;
    y: number;
    width?: number;
    height?: number;
    dropWidth?: number;
    dropHeight?: number;
    items?: any[];
    textField?: string;
    valueField?: string;
    fontSize?: string;
    textColor?: string;
    backgroundColor?: number;
    hoverColor?: string;
    selectedColor?: string;
    borderRadius?: number;
    iconKey?: string;
}

/**
 * 下拉列表
 * @todo
 * - 将masker、droppanel也纳入容器，简化销毁工作？
 */
export class DropDownList extends Phaser.GameObjects.Container {
    protected bg! : Phaser.GameObjects.Graphics;
    protected selectedText!: Phaser.GameObjects.Text;
    protected dropPanel: Phaser.GameObjects.Container | null = null;
    protected icon!: Phaser.GameObjects.Image;
    protected isOpen: boolean = false;
    protected selectedIndex: number = 0;
    protected items: any[] = [];
    protected options: Required<DropDownListOptions>;
    protected masker: Mask | null = null;

    //-----------------------------------------------------------
    // 事件
    //-----------------------------------------------------------
    protected changedCallback?: (index: number, item: any) => void;
    public onChanged(callback: (index: number, item: any) => void) : DropDownList {
        this.changedCallback = callback;
        return this;
    }


    //-----------------------------------------------------------
    // 扩展
    //-----------------------------------------------------------
    protected baseContainer : Phaser.GameObjects.Container | null = null;
    protected drawBaseUICallback: ((item: any) => Phaser.GameObjects.Container) | null = null;
    protected drawItemUICallback: ((item: any, index:number) => Phaser.GameObjects.Container) | null = null;
    protected showBaseUICallback: ((item: any) => void) | null = null;

    public setBaseUI(createUI: (item: any) => Phaser.GameObjects.Container): DropDownList {
        this.drawBaseUICallback = createUI;
        return this;
    }
    public setBaseUIOnShow(callback: (item: any) => void) : DropDownList {
        this.showBaseUICallback = callback;
        return this;
    }
    public setItemUI(createUI: (item: any, index:number) => Phaser.GameObjects.Container) : DropDownList {
        this.drawItemUICallback = createUI;
        return this;
    }


    //-----------------------------------------------------------
    // Life Cycle
    //-----------------------------------------------------------
    /**Destory */
    public destroy() {
        this.closeDropdown();
        this.masker?.destroy();
        super.destroy();
    }

    /**Set depth. */
    public override setDepth(value: number): this {
        super.setDepth(value);
        this.masker?.setDepth(value-1);  // mask 独立于dropdownlist，并未包含
        this.dropPanel?.setDepth(value+1);  // dropPanel 独立于dropdownlist，并未包含
        return this;
    }


    /**Bind items */
    public bind(items: any[], valueField?: string, textField?: string) : DropDownList {
        this.items = items;
        if (textField) this.options.textField = textField;
        if (valueField) this.options.valueField = valueField;
        this.selectedIndex = 0;
        this.showBaseUI();
        return this;
    }

    /**Constructor */
    constructor(scene: Scene, options: DropDownListOptions) {
        super(scene, options.x, options.y);
        scene.add.existing(this);

        this.options = {
            x: options.x,
            y: options.y,
            width: options.width || 200,
            height: options.height || 40,
            dropWidth: options.dropWidth || 200,
            dropHeight: options.dropHeight || 200,
            items: options.items || [],
            textField: options.textField || '',
            valueField: options.valueField || '',
            fontSize: options.fontSize || '28px',
            textColor: options.textColor || '#ffffff',
            backgroundColor: options.backgroundColor || 0xff0000,
            hoverColor: options.hoverColor || '#ffff00',
            selectedColor: options.selectedColor || '#ffff00',
            borderRadius: options.borderRadius || 10,
            iconKey: options.iconKey || GameConfig.icons.down.key
        };
        if (this.options.dropHeight < this.options.height) {
            this.options.dropHeight = this.options.height;
        }
        this.items = this.options.items;
        this.setSize(this.options.width, this.options.height);

        // 交互
        this.setInteractive({ useHandCursor: true });
        this.on('pointerdown', (pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) => {
            event.stopPropagation();
            if (this.isOpen) {
                this.closeDropdown();
            } else {
                this.openDropdown();
            }
        });

        // draw
        this.drawBg();
        this.drawArrowIcon();
        this.showBaseUI();

        // popup masker
        this.masker = new Mask(this.scene).setVisible(false);
        this.masker.onClick(() => {
            this.closeDropdown();
        });
    }


    private drawBg() {
        this.bg = this.scene.add.graphics();
        this.bg.fillStyle(this.options.backgroundColor, 1);
        this.bg.fillRoundedRect(
            -this.options.width / 2,
            -this.options.height / 2,
            this.options.width,
            this.options.height,
            this.options.borderRadius
        );
        this.add(this.bg);
    }

    private drawArrowIcon() {
        this.icon = this.scene.add.image(this.options.width / 2 - 20, 0, this.options.iconKey).setScale(0.8).setTint(0xffffff);
        this.add(this.icon);
    }

    /**绘制基础外观（未弹出状态） */
    protected showBaseUI() {
        if (this.items == null || this.items.length == 0)
            return;

        const selectedItem = this.items[this.selectedIndex];
        if (this.drawBaseUICallback) {
            if (!this.baseContainer) {
                this.baseContainer = this.drawBaseUICallback(selectedItem);
                this.add(this.baseContainer);
            }
            if (this.showBaseUICallback)
                this.showBaseUICallback(selectedItem);
        } else {
            const selectedText = this.getItemText(selectedItem);
            if (!this.selectedText){
                this.selectedText = this.scene.add.text(0, 0, selectedText, {
                    fontSize: this.options.fontSize,
                    color: this.options.textColor
                }).setOrigin(0.5);
                this.add([this.selectedText]);
            }
            this.selectedText.setText(selectedText);
        }
    }

    //---------------------------------------------------------
    // Dropdown panel
    //---------------------------------------------------------
    /**显示弹出列表 */
    protected openDropdown() {
        if (this.isOpen) return;
        this.isOpen = true;

        // masker
        // animate icon
        this.masker?.show();
        this.scene.tweens.add({targets: this.icon, angle: 180, duration: 200, ease: 'Power2'});

        // drop panel
        this.createDropPanel();

        // draw items
        this.items.forEach((item, index) => {
            if (this.drawItemUICallback) {
                const itemContainer = this.drawItemUICallback(item, index);
                itemContainer.setPosition(this.options.dropWidth/2, index * 40 + 25);
                itemContainer.setInteractive();
                itemContainer.on('pointerdown', () => this.setSelectedIndex(index));
                this.dropPanel!.add(itemContainer);
            } else {
                const itemText = this.scene.add.text(
                    this.options.dropWidth/2,
                    index * 40 + 25,
                    this.getItemText(item),
                    {
                        fontSize: this.options.fontSize,
                        color: index === this.selectedIndex ? this.options.selectedColor : this.options.textColor
                    }
                ).setOrigin(0.5);

                itemText.setInteractive();
                itemText.on('pointerover', () => {itemText.setColor(this.options.hoverColor);});
                itemText.on('pointerout',  () => {itemText.setColor(index === this.selectedIndex ? this.options.selectedColor : this.options.textColor);});
                itemText.on('pointerdown', () => {this.setSelectedIndex(index);});
                this.dropPanel!.add(itemText);
            }
        });
    }

    private createDropPanel() {
        var ox = this.x - this.options.dropWidth / 2;
        var oy = this.y + this.options.height / 2 + 2;
        var contentHeight = this.items.length * 40 + 40;
        if (contentHeight < this.options.dropHeight) {
            this.options.dropHeight = contentHeight;
        }
        this.dropPanel = new Panel(this.scene, ox, oy, this.options.dropWidth, this.options.dropHeight, contentHeight, this.options.borderRadius);
        this.dropPanel.setDepth(this.depth + 1);
    }

    protected closeDropdown() {
        if (!this.isOpen) return;
        this.isOpen = false;
        this.scene.tweens.add({ targets: this.icon, angle: 0, duration: 200, ease: 'Power2'});

        this.masker?.destroy();
        this.masker = null;
        this.dropPanel?.destroy();
        this.dropPanel = null;
    }

    //---------------------------------------------------
    // Item
    //---------------------------------------------------
    public getSelectedIndex(): number {
        return this.selectedIndex;
    }

    public getSelectedItem(): any {
        return this.items[this.selectedIndex];
    }

    public setSelectedIndex(index: number) {
        this.selectedIndex = index;
        const selectedItem = this.items[index];
        this.showBaseUI();
        this.closeDropdown();

        if (this.changedCallback)
            this.changedCallback(index, selectedItem);
    }

    public getSelectedValue(): any {
        return this.getItemValue(this.items[this.selectedIndex]);
    }

    public setSelectedValue(value: any) {
        const index = this.items.findIndex(item => this.getItemValue(item) === value);
        if (index !== -1) {
            this.setSelectedIndex(index);
        }
    }


    protected getItemText(item: any): string {
        if (typeof item === 'string') return item;
        if (this.options.textField) return item[this.options.textField];
        return item.toString();
    }

    protected getItemValue(item: any): any {
        if (typeof item === 'string') return item;
        if (this.options.valueField) return item[this.options.valueField];
        return item;
    }


}