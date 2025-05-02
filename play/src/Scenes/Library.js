import MatterLevel from "./MatterLevel.js";

export default class Library extends MatterLevel {
  constructor() {
    super('Library');
  }

  preload() {
    super.preload();
    this.load.pack('Library', 'assets/asset-pack.json', 'Library');
  }

  createBackground() {
    this.add.image(640, 360, "library").setScale(0.85);
  }

  cameraDemo() {
    this.cameras.main.setBounds(-170, -100, this.scale.width * 1.2, this.scale.height * 1.225);
    this.cameras.main.fadeIn(1000);
    this.cameras.main.zoomTo(1.2, 1000);

    this.cameras.main.once('camerafadeincomplete', () => {
      this.cameras.main.stopFollow();
      this.cameras.main.pan(100, 100, 3000, 'Sine.easeInOut');
      this.cameras.main.zoomTo(1.4, 1000);

      this.cameras.main.once('camerapancomplete', () => {
        this.cameras.main.zoomTo(1, 3000);
        this.cameras.main.pan(this.player.x, this.player.y, 3000, 'Sine.easeInOut');

        this.cameras.main.once('camerapancomplete', () => {
          this.cameras.main.startFollow(this.player, false, 0.1, 0.1);
          this.scene.start('Bridge');
        });

      });
    });
  }

  createLevel() {
    // 1) update camera bounds
    this.cameras.main.setBounds(-170, -100, this.scale.width * 1.2, this.scale.height * 1.225);

    // 2) create collision categories
    const groundCategory = this.matter.world.nextCategory();
    const petCategory    = this.matter.world.nextCategory();

    // 3) make your floor (ground) use the groundCategory
    const floor = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height - 5,
      this.scale.width * 1.5,
      20
    );
    const f = this.matter.add.gameObject(floor, {
      isStatic: true
    });

    this.registerFloor(f);

    // 5) start any dialogues, etc.
    this.dialogueManager.playAll();

    this.registerLevel(["Bridge", -100, 100, 120, 550]);

  }

  createDialogue() {
    super.createDialogue();
    this.dialogueManager.addDialogue(this.player, 'Hello!!', 3000);
    this.dialogueManager.addDialogue(this.pet,    'Meoww!!',       3000);
    this.dialogueManager.addDialogue(this.pet,    'My name is mittens, what shall I call you?',       3000);
    this.dialogueManager.addUserDialogue(this.player, 'My name is Yasser!', this.pet, 4000);
    this.dialogueManager.addDialogue(this.pet,    'Okay Yasser let\'s explore!',       3000);
    this.dialogueManager.addDialogue(this.pet, 'Follow me!', 5000);

  }
}
