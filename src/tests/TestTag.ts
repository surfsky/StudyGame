import { Scene } from 'phaser';
import { TestScene } from './TestScene';
import { Tag } from '../controls/Tag';

export class TestTag extends TestScene {
    constructor() {
        super({ key: 'TestTag' });
    }

    create() {
        this.createTitle("Tag标签");

        // 创建不同样式的标签
        const tags = [
            { text: "默认标签", options: {} },
            { text: "成功", options: { bgColor: 0x2ecc71, radius: 6 } },
            { text: "警告", options: { bgColor: 0xf1c40f, radius: 8 } },
            { text: "错误", options: { bgColor: 0xe74c3c, textStyle: { fontSize: '16px' } } },
            { text: "自定义", options: { 
                bgColor: 0x9b59b6,
                textColor: 0xffd700,
                radius: 10,
                padding: 12,
                textStyle: { fontSize: '18px', fontStyle: 'bold' }
            }}
        ];

        // 垂直布局显示标签
        const startY = 150;
        const spacing = 50;

        tags.forEach((tagConfig, index) => {
            const tag = new Tag(
                this,
                this.cameras.main.centerX,
                startY + (index * spacing),
                tagConfig.text,
                tagConfig.options
            );
        });
    }
}