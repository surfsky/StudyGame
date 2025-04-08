import Phaser from 'phaser';
import { Control } from './Control';

/**
 * 绘画辅助类
 */
export class Painter{

    /**创建一个圆角矩形*/
    public static drawRoundRect(
        graphics: Phaser.GameObjects.Graphics, 
        x:number, y:number, w:number, h:number, radius:number, 
        bgColor:number, bgAlpha=1, 
        borderColor=-1, borderWidth=1, borderAlpha=1
    ) : Phaser.GameObjects.Graphics{
        graphics.fillStyle(bgColor, bgAlpha);
        graphics.fillRoundedRect(x, y, w, h, radius);
        if (borderColor != -1){
            graphics.lineStyle(borderWidth, borderColor, borderAlpha);
            graphics.strokeRoundedRect(x, y, w, h, radius);
        }
        return graphics;
    }

    /**创建一个圆角矩形*/
    public static drawRect(
        graphics: Phaser.GameObjects.Graphics, 
        x:number, y:number, w:number, h:number, radius:number[], 
        bgColor:number, bgAlpha=1, 
        borderColor=-1, borderWidth=1, borderAlpha=1
    ) : Phaser.GameObjects.Graphics{

        var r = {tl:radius[0], tr:radius[1], br:radius[2], bl:radius[3]};
        graphics.fillStyle(bgColor, bgAlpha);
        graphics.fillRoundedRect(x, y, w, h, r);
        if (borderColor != -1){
            graphics.lineStyle(borderWidth, borderColor, borderAlpha);
            graphics.strokeRoundedRect(x, y, w, h, r);
        }
        return graphics;
    }


    /**绘制虚线*/
    public static drawDashedLine(graphics: Phaser.GameObjects.Graphics, x1: number, y1: number, x2: number, y2: number, 
        dashLength: number = 5, gapLength: number = 5, lineWidth: number = 1, lineColor: number = 0xa0a0a0
    ): Phaser.GameObjects.Graphics {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const dashCount = Math.floor(distance / (dashLength + gapLength));
        const stepX = dx / dashCount;
        const stepY = dy / dashCount;

        graphics.lineStyle(lineWidth, lineColor);
        for (let i = 0; i < dashCount; i++) {
            const startX = x1 + i * (stepX);
            const startY = y1 + i * (stepY);
            const endX = startX + stepX * (dashLength / (dashLength + gapLength));
            const endY = startY + stepY * (dashLength / (dashLength + gapLength));
            graphics.beginPath();
            graphics.moveTo(startX, startY);
            graphics.lineTo(endX, endY);
            graphics.strokePath();
        }
        return graphics;
    }

    /**绘制虚线矩形*/
    public static drawDashedRectangle(graphics: Phaser.GameObjects.Graphics, x: number, y: number, width: number, height: number, 
        dashLength: number = 5, gapLength: number = 5, lineWidth: number = 1, lineColor: number = 0xa0a0a0
    ): Phaser.GameObjects.Graphics {
        // 绘制四条虚线边
        this.drawDashedLine(graphics, x, y, x + width, y, dashLength, gapLength, lineWidth, lineColor);
        this.drawDashedLine(graphics, x + width, y, x + width, y + height, dashLength, gapLength, lineWidth, lineColor);
        this.drawDashedLine(graphics, x + width, y + height, x, y + height, dashLength, gapLength, lineWidth, lineColor);
        this.drawDashedLine(graphics, x, y + height, x, y, dashLength, gapLength, lineWidth, lineColor);
        return graphics;
    }
    
}
