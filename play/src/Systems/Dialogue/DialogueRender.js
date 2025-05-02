export default class DialogueRenderer {
    constructor(scene, character, content, duration, width, height, onComplete) {
        /** @type {Phaser.Scene} */
        this.scene = scene;
        this.character = character;
        this.content = content;
        this.duration = duration
        this.width = width;
        this.height = height;
        this.onComplete = onComplete;
        this.updateCallback = this.updatePosition.bind(this);
    }

    render() {
        const padding = 15;
        const maxTextWidth = 250;
        const style = {
          fontFamily: 'arial',
          fontSize: '16px',
          color: '#000',
          wordWrap: { width: maxTextWidth, useAdvancedWrap: true }
        };
    
        // 1) Create text & bg
        const txt = this.scene.add.text(0, 0, this.content, style);
        const bg  = this.scene.add.graphics().fillStyle(0xfff, 1);

        // 2) Put both into a container (at 0,0 for now)
        this.container = this.scene.add.container(0, 0, [ bg, txt ]);
    
        // 3) Measure and resize
        const bounds     = txt.getBounds();
        const boxWidth   = bounds.width  + padding * 2;
        const boxHeight  = bounds.height + padding * 2;
        bg.clear()
          .fillStyle(0xffffff, 0.9)
          .fillRoundedRect(0, 0, boxWidth, boxHeight, 5);
        txt.setPosition(padding, padding);
    
        // 4) Store for later
        this.boxWidth  = boxWidth;
        this.boxHeight = boxHeight;
        this.yOffset   = this.character.height / 2 + 50;
    
        // 5) Start following
        this.scene.events.on('update', this.updateCallback);
    
        // 6) Auto-destroy
        this.scene.time.delayedCall(this.duration, () => this.destroy());
      }
    
      updatePosition() {
        this.container.x = this.character.x - this.boxWidth  / 2;
        this.container.y = this.character.y - this.boxHeight - this.yOffset;
      }
    

    destroy() {
        this.scene.events.off('update', this.updateCallback);
        this.container.destroy();
        this.onComplete();
    }
}