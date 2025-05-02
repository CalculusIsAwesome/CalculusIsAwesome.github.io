import MatterLevel from "./MatterLevel.js";

export default class Bridge extends MatterLevel {
  constructor() {
    super('Bridge')
  }

  preload() {
    super.preload();
    this.load.pack("Bridge", "assets/asset-pack.json", "Bridge");
  }

  createOverlay() {
    this.add.image(640, 360, "overlay").setScale(1.2);
  }

  createLevel() {
    const hillRadius = 3500;
    const hillX = 700;
    const hillY = 4000;
    const hillBody = this.matter.add.circle(hillX, hillY, hillRadius, {
      isStatic: true,
    });

    this.registerFloor(hillBody);

    this.matter.world.add(hillBody);


    const hillGfx = this.add.graphics();
    hillGfx.fillStyle(0x556b2f);
    hillGfx.fillCircle(hillX, hillY, hillRadius);

    this.matter.add.gameObject(hillGfx, hillBody);

    const pending = []
    pending.push(this.add.rectangle(680, 500, 100, 100, 0xffb3ba));
    pending.push(this.add.rectangle(680, 420, 80, 80, 0xcafcab));
    pending.push(this.add.rectangle(680, 350, 70, 70, 0xbfdffa));
    pending.push(this.add.rectangle(680, 290, 60, 60, 0xfae1ff));
    pending.push(this.add.rectangle(680, 240, 50, 50, 0xafbaed));
    pending.push(this.add.circle(100, -100, 40, 0xbaffc9));
    pending.push(this.add.circle(200, 0, 50, 0xfdecf));
    pending.push(this.add.circle(300, -200, 40, 0xfafff9));
    pending.push(this.add.circle(400, -150, 20, 0xf0e68c));
    pending.push(this.add.circle(500, -100, 40, 0xfafac9));
    pending.push(this.add.circle(600, 0, 50, 0xcdefc));
    pending.push(this.add.circle(700, -200, 40, 0xcadfa9));
    pending.push(this.add.circle(800, -150, 20, 0x0da68c));
    pending.push(this.add.star(500, 200, 3, 32, 64, 0x0adcc));
    for (let i = 1; i < 5; i += 1) {
      pending.push(this.add.star(i, 200, 0 + i, 32, 64, 0x00ffcc));
    }

    for (let i = 0; i < pending.length; i++) {
      const obj = pending[i]
      if (obj instanceof Phaser.GameObjects.Rectangle) {
        this.matter.add.gameObject(obj);
      }

      else {
        this.matter.add.gameObject(obj, {
          shape: { type: 'circle', radius: obj.radius },
          restitution: 1
        });
      }
    }
  }
}