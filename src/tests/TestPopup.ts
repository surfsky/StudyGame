import { Scene } from 'phaser';
import { Popup } from '../controls/overlays/Popup';
import { Toast } from '../controls/overlays/Toast';
import { Button } from '../controls/forms/Button';
import { TestScene } from './TestScene';
import { Tooltip } from '../controls/overlays/Tooltip';

export class TestPopup extends TestScene {
    constructor() {
        super({ key: 'TestPopup' });
    }

    create() {
        this.createTitle("弹窗");

        // 创建按钮组
        const buttonStyle = {
            fontSize: '24px',
            backgroundColor: '#4CAF50',
            padding: { x: 20, y: 10 },
            fixedWidth: 200,
            align: 'center'
        };

        const buttons = [
            { text: '遮罩层', handler: () => this.showMask() },
            { text: '加载提示', handler: () => this.showLoading() },
            { text: 'Toast提示', handler: () => this.showToasts() },

            { text: '基础弹窗', handler: () => this.showBasicPopup() },
            { text: '消息框', handler: () => this.showMessageBox() },
            { text: '对话框', handler: () => this.showDialog() },
            { text: '左侧滑入', handler: () => this.showLeftSlidePopup() },
            { text: '右侧滑入', handler: () => this.showRightSlidePopup() },
            { text: '上方滑入', handler: () => this.showBottomSlidePopup() },
            { text: '下方滑入', handler: () => this.showTopSlidePopup() },
            { text: '圆角效果', handler: () => this.showCustomRadius() },
            { text: '阴影效果', handler: () => this.showCustomShadow() },
        ];

        buttons.forEach((button, index) => {
            const y = 150 + index * 80;
            const btn = new Button(this, this.cameras.main.centerX, y, button.text, {
                width: buttonStyle.fixedWidth,
                fontSize: buttonStyle.fontSize,
                bgColor: parseInt(buttonStyle.backgroundColor.replace('#', '0x')),
                padding: buttonStyle.padding.x
            });
            btn.on('click', button.handler);
        });
    }


    //-------------------------------------------------------
    //
    //-------------------------------------------------------
    showMask() {
        const popup = new Popup(this, this.cameras.main.centerX, this.cameras.main.centerY, {
            width: 0,
            height: 0,
            modal: true,
            modalAlpha: 0.8,
            closeOnClickOutside: true
        });
        popup.show();
    }

    showLoading() {
        const popup = new Popup(this, this.cameras.main.centerX, this.cameras.main.centerY, {
            width: 200,
            height: 80,
            animation: 'fade',
            closeOnClickOutside: false
        });

        const loadingText = this.add.text(0, 0, '加载中...', {
            fontSize: '24px',
            color: '#000000',
            align: 'center'
        }).setOrigin(0.5);

        popup.addContent(loadingText);
        popup.show();

        // 模拟3秒后自动关闭
        this.time.delayedCall(3000, () => {
            popup.hide();
        });
    }



    showToasts() {
        new Toast(this, '这是一条成功提示', {
            //backgroundColor: 0x4CAF50,
            duration: 1000
        }).show();
    }

    //-------------------------------------------------------
    //
    //-------------------------------------------------------
    showBasicPopup() {
        const popup = new Popup(this, this.cameras.main.centerX, this.cameras.main.centerY, {
            width: 400,
            height: 300,
            animation: 'scale',
            dragable: true,
            backgroundColor: 0xffffff,
            closeOnClickOutside: true,
        });

        const title = this.add.text(0, -100, '可拖拽弹窗示例', {
            fontSize: '28px',
            color: '#000000',
            align: 'center'
        }).setOrigin(0.5);

        const content = this.add.text(0, 0, '点击弹窗任意位置进行拖拽\n拖拽时可以移动到屏幕任意位置', {
            fontSize: '24px',
            color: '#3498db',
            align: 'center'
        }).setOrigin(0.5);

        popup.addContent([title, content]);
        popup.show();
    }

    showMessageBox() {
        const popup = new Popup(this, this.cameras.main.centerX, this.cameras.main.centerY, {
            width: 500,
            height: 200,
            animation: 'fade',
            closeOnClickOutside: false
        });

        const message = this.add.text(0, -30, '这是一个消息框示例', {
            fontSize: '24px',
            color: '#000000',
            align: 'center'
        }).setOrigin(0.5);

        const button = new Button(this, 0, 30, '确定', {
            width: 100,
            fontSize: '20px',
            bgColor: 0x4CAF50,
            padding: 20
        });
        button.on('click', () => popup.hide());

        popup.addContent([message, button]);
        popup.show();
    }

    showDialog() {
        const popup = new Popup(this, this.cameras.main.centerX, this.cameras.main.centerY, {
            width: 500,
            height: 250,
            animation: 'slideDown',
            closeOnClickOutside: false
        });

        const message = this.add.text(0, -50, '是否确认此操作？', {
            fontSize: '24px',
            color: '#000000',
            align: 'center'
        }).setOrigin(0.5);

        const buttonContainer = this.add.container(0, 30);
        
        const confirmButton = new Button(this, -70, 0, '确认', {
            width: 100,
            fontSize: '20px',
            bgColor: 0x4CAF50,
            padding: 20
        });
        confirmButton.on('click', () => popup.hide());

        const cancelButton = new Button(this, 70, 0, '取消', {
            width: 100,
            fontSize: '20px',
            bgColor: 0xf44336,
            padding: 20
        });
        cancelButton.on('click', () => popup.hide());

        buttonContainer.add([confirmButton, cancelButton]);
        popup.addContent([message, buttonContainer]);
        popup.show();
    }


    showCustomRadius() {
        const popup = new Popup(this, this.cameras.main.centerX, this.cameras.main.centerY, {
            width: 400,
            height: 300,
            animation: 'scale',
            backgroundColor: 0x3498db,
            borderRadius: [20, 5, 20, 5], // 左上、右上、右下、左下
            shadow: {
                color: 0x000000,
                blur: 15,
                offsetX: 0,
                offsetY: 6,
                alpha: 0.3
            }
        });

        const title = this.add.text(0, -100, '自定义圆角示例', {
            fontSize: '28px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        const content = this.add.text(0, 0, '不同角可以设置不同的圆角大小\n当前设置：[20, 5, 20, 5]', {
            fontSize: '24px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        popup.addContent([title, content]);
        popup.show();
    }

    showCustomShadow() {
        const popup = new Popup(this, this.cameras.main.centerX, this.cameras.main.centerY, {
            width: 400,
            height: 300,
            animation: 'scale',
            backgroundColor: 0xffffff,
            borderRadius: 15,
            shadow: {
                color: 0x3498db,
                blur: 20,
                offsetX: 8,
                offsetY: 8,
                alpha: 0.4
            }
        });

        const title = this.add.text(0, -100, '自定义阴影示例', {
            fontSize: '28px',
            color: '#000000',
            align: 'center'
        }).setOrigin(0.5);

        const content = this.add.text(0, 0, '可以自定义阴影的颜色、模糊度\n偏移量和透明度等效果', {
            fontSize: '24px',
            color: '#000000',
            align: 'center'
        }).setOrigin(0.5);

        popup.addContent([title, content]);
        popup.show();
    }

    showLeftSlidePopup() {
        const popup = new Popup(this, 0, 0, {
            width: 400,
            height: this.game.canvas.height,
            modal: false,
            animation: 'slideLeft',
            showCloseButton: true,
            closeButtonStyle: {
                color: 0xffffff
            },
            backgroundColor: 0x3498db,
            anchor: 'left',
            borderRadius: [0, 15, 15, 0]
        });

        const content = this.add.text(0, 0, '左侧滑入动画示例\n点击右上角关闭按钮关闭', {
            fontSize: '24px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        popup.addContent(content);
        popup.show();
    }

    showRightSlidePopup() {
        const popup = new Popup(this, 0, 0, {
            width: 400,
            height: this.game.canvas.height,
            modal: false,
            animation: 'slideRight',
            showCloseButton: true,
            backgroundColor: 0xe74c3c,
            anchor: 'right',
            borderRadius: [15, 0, 0, 15]
        });

        const content = this.add.text(0, 0, '右侧滑入动画示例\n点击右上角关闭按钮关闭', {
            fontSize: '24px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        popup.addContent(content);
        popup.show();
    }

    showTopSlidePopup() {
        const popup = new Popup(this, 0, 0, {
            width: this.game.canvas.width,
            height: 300,
            modal: false,
            animation: 'slideUp',
            showCloseButton: true,
            backgroundColor: 0x2ecc71,
            anchor: 'bottom',
            borderRadius: [15, 15, 0, 0]
        });

        const content = this.add.text(0, 0, '下方滑入动画示例\n点击右上角关闭按钮关闭', {
            fontSize: '24px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        popup.addContent(content);
        popup.show();
    }

    showBottomSlidePopup() {
        const popup = new Popup(this, 0, 0, {
            width: this.game.canvas.width,
            height: 300,
            modal: false,
            animation: 'slideDown',
            showCloseButton: true,
            backgroundColor: 0x9b59b6,
            anchor: 'top',
            borderRadius: [0, 0, 15, 15]
        });

        const content = this.add.text(0, 0, '上方滑入动画示例\n点击右上角关闭按钮关闭', {
            fontSize: '24px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        popup.addContent(content);
        popup.show();
    }
}