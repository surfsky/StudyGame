
/**可拖动滚动面板 */
export class Panel extends Phaser.GameObjects.Container {
    private contentH: number = 0;
    private contentMask: Phaser.GameObjects.Graphics;
    private bg: Phaser.GameObjects.Rectangle;

    /**
     * 创建一个可滚动的面板
     * @param {Phaser.Scene} scene - 场景实例
     * @param {number} x - 面板的x坐标
     * @param {number} y - 面板的y坐标
     * @param {number} w - 面板的宽度
     * @param {number} h - 面板的可视高度
     * @param {number} contentH - 内容的实际高度
     */
    constructor(scene: Phaser.Scene, 
        x: number, y: number, w: number, h: number, 
        contentH: number, radius: number = 0,
        bgColor: number = 0x000000, bgAlpha: number = 0.8,
        handerColor: number = 0xffffff, handerAlpha: number = 0.2,
    ) {
        super(scene, x, y);
        this.setSize(w, h);
        scene.add.existing(this);
        this.contentH = contentH;

        // 创建遮罩（显示区域）
        this.contentMask = this.createRoundRect(scene, x, y, w, h, radius, 0xffffff, 1).setVisible(false);
        this.setMask(new Phaser.Display.Masks.GeometryMask(scene, this.contentMask));

        // 创建背景
        //this.bg = this.createRoundRect(scene, 0, 0, w, contentH, radius, bgColor, bgAlpha);
        this.bg = scene.add.rectangle(0, 0, w, contentH, bgColor, bgAlpha).setOrigin(0, 0).setDepth(this.depth - 1);
        this.add(this.bg);

        // 创建滚动轴
        this.setScrollbar(handerColor, handerAlpha);
    }

    /**设置深度（将背景层的层次也提高 */
    override setDepth(value: number): this {
        this.bg.setDepth(value - 1);
        return super.setDepth(value);
    }

    /**设置滚动轴滑块 */
    private setScrollbar(handerColor: number = 0xffffff, handerAlpha: number = 0.5) {
        var scene = this.scene;
        var w = this.width;
        var h = this.height;
        var contentH = this.contentH;
        if (contentH <= h) return;
        // 创建滑块(滑块的高度是根据内容的实际高度和面板的可视高度来计算的)
        const scrollBar = this.createRoundRect(scene, this.x + w - 10, this.y, 10, h / contentH * h, 5, handerColor, handerAlpha).setDepth(999);
        scrollBar.setMask(new Phaser.Display.Masks.GeometryMask(scene, this.contentMask));
        this.setDragEvents(scene, scrollBar);
    }

    /**设置定位方式 */
    setOrigin(x: number, y: number): this {
        this.x = this.x - this.width * x;
        this.y = this.y - this.height * y;
        this.setScrollbar();
        return this;
    }

    /**设置实际内容高度 */
    public setContentHeight(contentH: number) {
        this.contentH = contentH;
        // set mask
        this.contentMask.clear();
        this.contentMask.fillRoundedRect(this.x, this.y, this.width, this.height, 10);
        this.setScrollbar();
    }

    /**设置拖拽逻辑 */
    private setDragEvents(scene: Phaser.Scene, scrollBar: Phaser.GameObjects.Graphics) {
        var contentH = this.contentH;
        var y = this.y;
        var h = this.height;
        let isDragging = false;
        let lastY = 0;

        // scene.input
        this.bg.setInteractive();
        this.bg.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            isDragging = true;
            lastY = pointer.y;
            pointer.event.stopPropagation();  // 阻止事件穿透到下面
        });
        this.bg.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            isDragging = false;
            //pointer.event.stopPropagation();  // 阻止事件穿透到下面
        });
        this.bg.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (!isDragging) return;
            var dy = pointer.y - lastY;
            lastY = pointer.y;

            // 计算新的Y实际位置
            let newY = this.y + dy;
            var minY = y - (contentH - h);
            var maxY = y;
            newY = Phaser.Math.Clamp(newY, minY, maxY);
            dy = newY - y; // 计算实际移动距离

            // 更新容器和滑块位置
            this.y = newY;
            scrollBar.y = y - dy;
            //pointer.event.stopPropagation();  // 阻止事件穿透到下面
        });

        // 添加鼠标滚轮事件支持
        this.bg.on('wheel', (pointer: Phaser.Input.Pointer, gameObjects: any, deltaX: number, deltaY: number) => {
            // 计算滚动距离，deltaY为正表示向下滚动，为负表示向上滚动
            const scrollSpeed = 0.5;
            const dy = -deltaY * scrollSpeed;

            // 计算新的Y实际位置
            let newY = this.y + dy;
            var minY = y - (contentH - h);
            var maxY = y;
            newY = Phaser.Math.Clamp(newY, minY, maxY);
            const actualDy = newY - this.y;

            // 更新容器和滑块位置
            this.y = newY;
            scrollBar.y = scrollBar.y - actualDy;
            //pointer.event.stopPropagation();  // 阻止事件穿透到下面
        });
    }

    /**创建一个圆角矩形*/
    createRoundRect(scene:Phaser.Scene, x:number, y:number, w:number, h:number, radius:number, bgColor:number, bgAlpha=1, borderColor=-1, borderWidth=1, borderAlpha=1) : Phaser.GameObjects.Graphics{
        const graphics = scene.add.graphics();
        graphics.fillStyle(bgColor, bgAlpha);
        graphics.fillRoundedRect(x, y, w, h, radius);
        if (borderColor != -1){
            graphics.lineStyle(borderWidth, borderColor, borderAlpha);
            graphics.strokeRoundedRect(x, y, w, h, radius);
        }
        return graphics;
    }

    /**
     * 销毁滚动面板
     */
    public destroy(): void {
        this.contentMask.destroy();
        this.list.forEach(child => child.destroy());
        super.destroy();
    }
}