export default class LoadUI {
    constructor(scene) {
        this.scene = scene;
    }


    rendor() {

        const { width, height } = this.scene.scale;

        const key = 'bgGradient';
        if (!this.scene.textures.exists(key)) {
            const canvasTex = this.scene.textures.createCanvas(key, width, height);
            const ctx = canvasTex.getContext();

            const θ = Phaser.Math.DEG_TO_RAD * 120;
            const dx = Math.sin(θ);
            const dy = -Math.cos(θ);
            const len = Math.hypot(width, height);
            const half = len / 2;
            const cx = width / 2;
            const cy = height / 2;

            const x0 = cx - dx * half;
            const y0 = cy - dy * half;
            const x1 = cx + dx * half;
            const y1 = cy + dy * half;

            const grad = ctx.createLinearGradient(x0, y0, x1, y1);
            grad.addColorStop(0.15, 'rgba(0,204,255,0.3)');
            grad.addColorStop(0.85, 'rgba(204,0,119, 0.2)');

            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, width, height);

            canvasTex.refresh();
        }

        this.scene.add
            .image(0, 0, key)
            .setOrigin(0, 0)
            .setDepth(-1);

        const progressBar = this.scene.add.rectangle(553, 561, 256, 20);
        progressBar.setOrigin(0, 0);
        progressBar.isFilled = true;
        progressBar.fillColor = 0xbdffff; // or magenta 0xb30068;

        const progressBarBg = this.scene.add.rectangle(553, 561, 256, 20);
        progressBarBg.setOrigin(0, 0);
        progressBarBg.strokeColor = 0xbdffff;
        progressBarBg.isStroked = true;

        const loadingText = this.scene.add.text(553, 529, "", {});
        loadingText.text = "Loading...";
        loadingText.setStyle({ "color": "#bdffff", "fontFamily": "arial", "fontSize": "20px" });

        this.scene.progressBar = progressBar;

        const width2 = this.scene.progressBar.width;

        this.scene.load.on("progress", (progress) => {

            this.scene.progressBar.width = progress * width2;
        });


        this.scene.anims.create({
            key: 'loading',
            frames: this.scene.anims.generateFrameNumbers('loading', { start: 0, end: 77 }),
            frameRate: 30,
            repeat: -1
        });

        const loaderSprite = this.scene.add.sprite(690, 320, 'loading');
        loaderSprite.play('loading');

    }

}