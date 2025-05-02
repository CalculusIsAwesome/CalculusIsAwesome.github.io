import DialogueRenderor from "./DialogueRender.js";

export default class DialogueBox {
    constructor(scene, character, content, duration = null) {
        this.scene = scene;
        this.character = character;
        this.content = content;
        this.duration = duration;
        this.width = 0;
        this.height = 0;
    }

    play() {
        return new Promise(resolve => {
            const renderer = new DialogueRenderor(
                this.scene,
                this.character,
                this.content,
                this.duration,
                this.width,
                this.height,
                resolve
            );
            this.instance = renderer
            renderer.render();
        });
    }

    stop() {
        this.instance.destroy();
    }
}