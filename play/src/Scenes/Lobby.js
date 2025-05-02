export default class Lobby extends Phaser.Scene {

	constructor() {
		super("Lobby");
	}

	create() {
		const b = this.add.image(this.scale.width / 2, this.scale.height / 2, 'lobby').setScale(0.725);
		b.setInteractive();
		b.on('pointerup', () => {
			this.scene.start('Library')
		});
	}

}