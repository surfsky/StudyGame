import { Scene } from 'phaser';
import { Button } from '../controls/forms/Button';
import { Mask } from '../controls/overlays/Mask';
import { Loading } from '../controls/overlays/Loading';
import { MessageBox } from '../controls/overlays/MessageBox';
import { StudyDb } from './StudyDb';
import { Rect } from '../controls/Rect';
import { Link } from '../controls/Link';
import { FileSelector } from '../controls/FileSelector';
import { DialogResult } from '../controls/overlays/DialogResult';

export class ImportDialog extends Phaser.GameObjects.Container {
    private masker: Mask;
    private result: DialogResult = DialogResult.Cancel;

    constructor(scene: Scene, dialogWidth: number=400, dialogHeight: number=300) {
        super(scene, 0, 0);
        scene.add.existing(this);
        this.masker = new Mask(scene); // 创建遮罩
        this.add(this.masker);

        // 创建对话框背景
        const x = scene.cameras.main.centerX - dialogWidth / 2;
        const y = scene.cameras.main.centerY - dialogHeight / 2;
        var rect = new Rect(scene, x, y, dialogWidth, dialogHeight, 10, 0xffffff, 1, 0x000000, 2);
        this.add(rect);

        // 创建关闭按钮
        const closeButton = new Button(scene, x + dialogWidth - 30, y+30, 'X', {
            width: 30,
            height: 30,
            radius: 15,
            bgColor: 0xe74c3c,
            fontSize: '16px'
        }).on('click', () => this.close(DialogResult.Cancel));
        this.add(closeButton);

        // 创建标题
        this.createUI(scene, x, dialogWidth, y);
        this.setVisible(false);  // 初始化为隐藏状态
    }

    /**
     * 显示对话框
     */
    public  show(): DialogResult {
        this.setVisible(true);
        this.masker.show();
        return this.result;
    }

    /**
     * 隐藏对话框
     */
    private async close(result: DialogResult): Promise<void> {
        this.result = result;
        await this.masker.hide();
        this.setVisible(false);
        this.closeCallback(this.result);
    }

    // 关闭回调函数
    private closeCallback: (result: DialogResult) => void = () => { };
    public onClose(callback: (result: DialogResult) => void) {
        this.closeCallback = callback;
    }

    /**创建窗体UI */
    private createUI(scene: Scene, x: number, dialogWidth: number, y: number) {
        const title = scene.add.text(x + dialogWidth / 2, y + 30, '导入单词表', {
            fontSize: '24px',
            color: '#000'
        }).setOrigin(0.5);
        this.add(title);

        // 创建说明文本
        const desc = scene.add.text(x + dialogWidth / 2, y + 100, '请选择Excel文件，每个sheet为一个关卡', {
            fontSize: '16px',
            color: '#666'
        }).setOrigin(0.5);
        this.add(desc);

        // 创建下载模板链接
        var linkUrl = '/assets/levels/template.xlsx';
        var link = new Link(scene, x + dialogWidth / 2, y + 140, '下载模版', linkUrl, '模版.xlsx', '14px', '#2980b9').setOrigin(0.5);
        this.add(link);

        // 创建选择文件按钮
        var filer = new FileSelector(scene, x + dialogWidth / 2, y + 180, '选择文件', '.xlsx,.xls', {
            width: 200,
            height: 40,
            bgColor: 0x2ecc71
        }).onFileSelected(async (files, input) => {
            await this.importFiles(files, input);
        });
        this.add(filer);
    }

    /**导入文件 */
    private async importFiles(files: FileList | null, input: HTMLInputElement) {
        if (files && files[0]) {
            Loading.show(this.scene);
            try {
                var result = await StudyDb.importExcelFile(files[0]);
                const resultText = ['成功导入单词表：\n'];
                result.forEach(item => {
                    resultText.push(`${item.name}   ${item.count}个\n`);
                });
                await MessageBox.show(this.scene, '导入成功', resultText.join(''));
                this.close(DialogResult.Ok);
                //this.scene.events.emit('refreshLevels'); // 触发刷新事件
            } catch (error: any) {
                await MessageBox.show(this.scene, '导入失败', error.message);
            } finally {
                Loading.hide();
                input.value = '';
            }
        }
    }



}
