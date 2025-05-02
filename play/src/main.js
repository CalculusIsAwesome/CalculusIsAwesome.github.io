import Bridge from "./Scenes/Bridge.js";
import Library from "./Scenes/Library.js";
import Lobby from "./Scenes/Lobby.js";
import Preload from "./Scenes/Preload.js";

window.addEventListener('load', function () {

	var game = new Phaser.Game({
		width: 1280,
		height: 720,
		type: Phaser.AUTO,
        backgroundColor: "#0C0C0C",
		scale: {
			mode: Phaser.Scale.FIT,
			autoCenter: Phaser.Scale.CENTER_BOTH
		},
	});

	game.scene.add("Preload", Preload);
	game.scene.add("Boot", Boot, true);
	game.scene.add("Lobby", Lobby);
	game.scene.add("Bridge", Bridge);
	game.scene.add("Library", Library);

});

class Boot extends Phaser.Scene {

	preload() {
		this.load.pack("pack", "assets/preload-asset-pack.json");
	}

	create() {
		this.scene.start("Preload");
	}
}