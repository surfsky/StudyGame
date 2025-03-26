import Phaser from 'phaser';

/**超链接，可下载文件 */
export class Link extends Phaser.GameObjects.Text
{
    constructor(
        scene: Phaser.Scene, 
        x: number = 0, y: number = 0, text: string, linkUrl: string, fileName='',
        fontSize: string='14px', color: string='#2980b9', hoverColor: string='#3498db'
    ) {
        super(scene, x, y, text, {fontSize: fontSize, color: color});
        scene.add.existing(this);

        // 交互事件
        this.setInteractive({ useHandCursor: true });
        this.on('pointerover', () => {
            this.setStyle({ color: hoverColor });
        });
        this.on('pointerout', () => {
            this.setStyle({ color: color });
        });
        this.on('pointerdown', () => {
            const link = document.createElement('a');
            link.href = linkUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });

        /*
        const templateLink = scene.add.text(px, py, linkText, {
            fontSize: '14px',
            color: '#2980b9'
        }).setOrigin(0.5);
        templateLink.setInteractive({ useHandCursor: true });
        templateLink.on('pointerover', () => {
            templateLink.setStyle({ color: '#3498db' });
        });
        templateLink.on('pointerout', () => {
            templateLink.setStyle({ color: '#2980b9' });
        });
        templateLink.on('pointerdown', () => {
            const link = document.createElement('a');
            link.href = linkUrl;
            link.download = '单词表.xlsx';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
        */

    }
}

