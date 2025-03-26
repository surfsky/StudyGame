import { Control } from '../Control';

export interface TextBoxOptions {
    width?: number;
    height?: number;
    fontSize?: string;
    bgColor?: number;
    borderColor?: number;
    focusColor?: number;
    placeholder?: string;
    maxLength?: number;
    type?: string;
    value?: string;
}

export class TextBox extends Control {
    private text!: Phaser.GameObjects.Text;
    private background!: Phaser.GameObjects.Graphics;
    private placeholder!: Phaser.GameObjects.Text;
    private options: TextBoxOptions;
    private focused: boolean = false;
    private value: string = '';

    constructor(scene: Phaser.Scene, x: number, y: number, options: TextBoxOptions = {}) {
        const {
            width = 200,
            height = 40
        } = options;

        super(scene, x, y, width, height);
        this.options = {
            fontSize: '24px',
            bgColor: 0xffffff,
            borderColor: 0x4a90e2,
            focusColor: 0x5ba1f3,
            placeholder: '',
            maxLength: 100,
            type: 'text',
            value: '',
            ...options
        };

        this.value = this.options.value || '';
        this.createBackground();
        this.createPlaceholder();
        this.createText();
        this.setupInteractive();
    }

    private createBackground() {
        this.background = this.scene.add.graphics();
        this.drawBackground();
        this.add(this.background);
    }

    private createPlaceholder() {
        this.placeholder = this.scene.add.text(5 - this.width/2, 0, this.options.placeholder||'', {
            fontSize: this.options.fontSize,
            color: '#999999'
        }).setOrigin(0, 0.5);
        this.add(this.placeholder);
        this.updatePlaceholderVisibility();
    }

    private createText() {
        this.text = this.scene.add.text(5 - this.width/2, 0, this.value, {
            fontSize: this.options.fontSize,
            color: '#000000'
        }).setOrigin(0, 0.5);
        this.add(this.text);
    }

    private drawBackground() {
        this.background.clear();
        const color = this.focused ? (this.options.focusColor || 0x5ba1f3) : (this.options.borderColor || 0x4a90e2);
        this.background.lineStyle(2, color);
        this.background.fillStyle(this.options.bgColor || 0xffffff);
        this.background.fillRect(-this.width/2, -this.height/2, this.width, this.height);
        this.background.strokeRect(-this.width/2, -this.height/2, this.width, this.height);
    }

    private setupInteractive() {
        this.setInteractive(new Phaser.Geom.Rectangle(-this.width/2, -this.height/2, this.width, this.height), Phaser.Geom.Rectangle.Contains);
        
        this.on('pointerdown', () => {
            this.focus();
        });

        this.scene.input.keyboard!.on('keydown', (event: KeyboardEvent) => {
            if (!this.focused) return;

            if (event.key === 'Backspace') {
                this.value = this.value.slice(0, -1);
            } else if (event.key.length === 1 && this.value.length < (this.options.maxLength || 100)) {
                if (this.options.type === 'number' && !/\d/.test(event.key)) return;
                this.value += event.key;
            }

            this.text.setText(this.value);
            this.updatePlaceholderVisibility();
            this.emit('change', this.value);
        });

        this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (!this.getBounds().contains(pointer.x, pointer.y)) {
                this.blur();
            }
        });
    }

    private updatePlaceholderVisibility() {
        this.placeholder.setVisible(this.value.length === 0);
    }

    public focus() {
        this.focused = true;
        this.drawBackground();
        this.emit('focus');
    }

    public blur() {
        this.focused = false;
        this.drawBackground();
        this.emit('blur');
    }

    public setValue(value: string) {
        this.value = value;
        this.text.setText(value);
        this.updatePlaceholderVisibility();
        return this;
    }

    public getValue(): string {
        return this.value;
    }

    public setPlaceholder(text: string) {
        this.options.placeholder = text;
        this.placeholder.setText(text);
        return this;
    }

    public destroy() {
        this.scene.input.keyboard!.off('keydown');
        super.destroy();
    }
}