import LoadUI from "./UI/LoadUI.js"


export default class Preload extends Phaser.Scene {

	constructor() {
		super("Preload");
	}


	preload() {
		new LoadUI(this).rendor();
		this.load.pack("Global", "/assets/asset-pack.json", "Global");
		this.load.pack('Lobby', '/assets/asset-pack.json', 'Lobby');
	}

	create() {
		this.scene.start("Lobby");
	}
}
