import { Scene } from 'phaser';
import { Button } from '../controls/buttons/Button';
import { DialogResult } from '../controls/overlays/DialogResult';
import { TestScene } from './SceneBase';
import { MessageBox } from '../controls/overlays/MessageBox';

export class TestDialog extends TestScene {
    constructor() {
        super({ key: 'TestDialog' });
    }

    create() {
        super.createTitle('MessageBox');
        this.createBaseLine();


        // 基本消息对话框
        const basicButton = new Button(this, this.cameras.main.centerX, 150, '基本消息对话框', {
            width: 240,
            height: 40
        });
        basicButton.onClick(async () => {
            const result = await MessageBox.show(this, {
                message: '这是一个基本的消息对话框'
            });
            console.log('对话框结果：', result);
        });

        // 确认对话框
        const confirmButton = new Button(this, this.cameras.main.centerX, 220, '确认对话框', {
            width: 240,
            height: 40
        });
        confirmButton.onClick(async () => {
            const result = await MessageBox.show(this, {
                title: '确认操作',
                message: '是否确认执行此操作？',
                showCancel: true
            });
            if (result === DialogResult.Ok) {
                console.log('用户确认了操作');
            } else {
                console.log('用户取消了操作');
            }
        });

        // 自定义按钮文本的对话框
        const customButton = new Button(this, this.cameras.main.centerX, 290, '自定义按钮对话框', {
            width: 240,
            height: 40
        });
        customButton.onClick(async () => {
            const result = await MessageBox.show(this, {
                title: '删除确认',
                message: '确认要删除这条记录吗？\n此操作不可撤销！',
                showCancel: true,
                okText: '删除',
                cancelText: '返回'
            });
            if (result === DialogResult.Ok) {
                console.log('用户确认删除');
            }
        });

        // 自定义尺寸的对话框
        const sizeButton = new Button(this, this.cameras.main.centerX, 360, '自定义尺寸对话框', {
            width: 240,
            height: 40
        });
        sizeButton.onClick(async () => {
            const result = await MessageBox.show(this, {
                title: '提示',
                message: '这是一个较大尺寸的对话框，可以显示更多的内容。\n支持多行文本显示，并会自动换行。',
                width: 500,
                height: 300,
                showCancel: true
            });
            console.log('对话框结果：', result);
        });
    }
}