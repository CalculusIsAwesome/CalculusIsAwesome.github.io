import DialogueBox from "./DialogueBox.js";
import UserDialogueBox from "./UserDialogueBox.js";

export default class DialogueManager {
    constructor(scene) {
        this.scene = scene;
        this.dialogue = [];
        this.delay = 500;
        this.recentlyPlaying = null;
    }

    speak(character, content, duration = 3000) {
        if (this.recentlyPlaying != null) {
            this.recentlyPlaying.stop();
        }

        const newDialogueBox = new DialogueBox(this.scene, character, content, duration);
        newDialogueBox.play();
        this.recentlyPlaying = newDialogueBox;
    }

    addDialogue(character, content, duration = null) {
        const newDialogueBox = new DialogueBox(this.scene, character, content, duration);
        this.dialogue.push(newDialogueBox);
    }

    addUserDialogue(character, content, pet, duration = null) {
        const newDialogueBox = new UserDialogueBox(this.scene, character, content, pet, duration);
        this.dialogue.push(newDialogueBox);
    }

    async playAll() {
        while (this.dialogue.length > 0) {
            const nextDialogueBox = this.dialogue.shift();
            await nextDialogueBox.play();
            await this.wait(this.delay);
        }
    }

    wait(ms) {
        return new Promise(resolve => {
          this.scene.time.delayedCall(ms, resolve);
        });
      }

    playNext() {
        if (this.dialogue.length > 0) {
            const nextDialogueBox = this.dialogue.shift();
            nextDialogueBox.play();
        }
    }
}