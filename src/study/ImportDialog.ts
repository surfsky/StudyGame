import { Scene } from 'phaser';
import { Button } from '../controls/buttons/Button';
import { Loading } from '../controls/overlays/Loading';
import { MessageScene } from '../controls/overlays/MessageScene';
import { StudyDb } from './StudyDb';
import { Link } from '../controls/basic/Link';
import { FileButton } from '../controls/buttons/FileButton';
import { DialogResult } from '../controls/overlays/DialogResult';
import { Dialog } from '../controls/overlays/Dialog';

export class ImportDialog extends Dialog {
    constructor(scene: Scene) {
        super(scene, '', 400, 300);
        this.createUI();
    }

    /**创建窗体UI */
    private createUI() {
        const title = this.scene.add.text(this.width / 2, 30, '导入单词表', {
            fontSize: '24px',
            color: '#000'
        }).setOrigin(0.5);
        this.add(title);

        // 创建说明文本
        const desc = this.scene.add.text(this.width / 2, 100, '请选择Excel文件，每个sheet为一个关卡', {
            fontSize: '16px',
            color: '#666'
        }).setOrigin(0.5);
        this.add(desc);

        // 创建下载模板链接
        var linkUrl = '/assets/levels/template.xlsx';
        var link = new Link(this.scene, this.width / 2 - 40, 140, '下载模版', linkUrl, '模版.xlsx');
        this.add(link);

        // 创建选择文件按钮
        var filer = new FileButton(this.scene, this.width / 2, 240, '选择文件', '.xlsx,.xls', {
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
                await MessageScene.show(this.scene, '导入成功', resultText.join(''));
                this.close(DialogResult.Ok);
                //this.scene.events.emit('refreshLevels'); // 触发刷新事件
            } catch (error: any) {
                await MessageScene.show(this.scene, '导入失败', error.message);
            } finally {
                Loading.hide();
                input.value = '';
            }
        }
    }
}
