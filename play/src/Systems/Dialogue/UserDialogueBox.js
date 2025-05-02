// UserDialogueBox.js
import DialogueRenderor from "./DialogueRender.js";
import UserInputRender from "./UserInputRender.js";

export default class UserDialogueBox {
  /**
   * @param {Phaser.Scene} scene
   * @param {Phaser.GameObjects.Sprite} character
   * @param {string} content
   * @param {number|null} duration
   * @param {{ speak: (msg: string) => void }} pet
   */
  constructor(scene, character, content, pet, duration = null) {
    this.scene = scene;
    this.character = character;
    this.content = content;
    this.duration = duration;
    this.width = 0;
    this.height = 0;
    this.pet = pet;
  }

  /** 
   * Plays the input prompt, retries on invalid until the string matches exactly.
   */
  async play() {
    const userInput = new UserInputRender(
      this.scene,
      this.character,
      this.content,
      this.width,
      this.height,
      // onComplete: nothing extra (promise resolves internally)
      () => {},
      // onInvalid: pet speaks the mistake
      badStr => {
        this.scene.dialogueManager.speak(
            this.pet,
            `Invalid input: “${badStr}” — should be “${this.content}”.`
        );
      }
    );

    userInput.render();
    // wait until inputPromise resolves with the correct string
    this.content = await userInput.inputPromise;
    return this.playDialogue();
  }

  /** Renders the next dialogue line using DialogueRenderor */
  playDialogue() {
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
      renderer.render();
    });
  }
}
