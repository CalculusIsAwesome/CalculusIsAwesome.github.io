// UserInputRender.js
/** 
 * Handles rendering of a user input bar and per-character feedback in a Phaser scene.
 */
export default class UserInputRender {
    // Private fields
    #scene;
    #character;
    #content;
    #width;
    #height;
    #onComplete;
    #onInvalid;
  
    #container;
    #inputBar;
    #textContainer;
    #letterPool = [];
    #inputString = '';
  
    // New private fields for placeholder and cursor
    #placeholderText;
    #cursor;
  
    // Configuration constants
    static DEFAULT_CHAR_WIDTH = 12;
    static DEFAULT_STYLE = { fontFamily: 'monospace', fontSize: '16px', color: '#000' };
  
    #charWidth;
    #style;
    #updateCallback;
    #keyListener;
  
    /**
     * @param {Phaser.Scene} scene        - The Phaser scene instance.
     * @param {Phaser.GameObjects.Sprite} character - The character to follow.
     * @param {string} content            - The expected input string for validation.
     * @param {number} width              - Width of the input bar (currently unused).
     * @param {number} height             - Height of the input bar (currently unused).
     * @param {Function} onComplete       - Called when valid input is entered.
     * @param {Function} onInvalid        - Called with the bad string when invalid.
     */
    constructor(
      scene,
      character,
      content,
      width = 0,
      height = 0,
      onComplete = () => {},
      onInvalid = () => {}
    ) {
      this.#scene = scene;
      this.#character = character;
      this.#content = content;
      this.#width = width;
      this.#height = height;
      this.#onComplete = onComplete;
      this.#onInvalid = onInvalid;
  
      this.#charWidth = UserInputRender.DEFAULT_CHAR_WIDTH;
      this.#style     = { ...UserInputRender.DEFAULT_STYLE };
  
      this.#container = this.#scene.add.container(
        this.#character.x,
        this.#character.y - 200
      );
  
      this.#updateCallback = this.updatePosition.bind(this);
      this.#keyListener    = this.onKeyInput.bind(this);
  
      /** Promise that resolves with the final valid input string */
      this.inputPromise = new Promise(resolve => {
        this._resolveInput = resolve;
      });
    }
  
    /**
     * Starts listening for updates and renders the input bar.
     * @returns {Promise<string>} Resolves when valid input is entered.
     */
    render() {
      this.#scene.events.on('update', this.#updateCallback);
      this.createInputBar();
      return this.inputPromise;
    }
  
    /**
     * Constructs and displays the input bar, placeholder, cursor, and text placeholders.
     */
    createInputBar() {
      const { width: sw, height: sh } = this.#scene.scale;
      const barWidth  = sw * 0.75;
      const barHeight = 40;
      const x = sw * 0.5;
      const y = sh - 40;
  
      // 1) Draw two rounded rectangles via Graphics:
      this.#inputBar = this.#scene.add.graphics().setScrollFactor(0);
      // Outer (dark black), radius 10
      this.#inputBar
        .fillStyle(0xcccccc, 1)
        .fillRoundedRect(x - barWidth/2, y - barHeight/2, barWidth, barHeight, 10);
      // Inner (lighter black), inset by 2px, radius 8
      this.#inputBar
        .fillStyle(0xffffff, 1)
        .fillRoundedRect(x - barWidth/2 + 2, y - barHeight/2 + 2, barWidth - 4, barHeight - 4, 8);
  
      // 2) Create a container for text and cursor
      this.#textContainer = this.#scene.add.container(
        x - barWidth / 2 + 10,
        y - barHeight / 2 + (barHeight - parseInt(this.#style.fontSize)) / 2
      ).setScrollFactor(0);
  
      // Placeholder text
      this.#placeholderText = this.#scene.add.text(
        0, 0,
        'Type to write…',
        { ...this.#style, color: '#777777' }
      ).setOrigin(0, 0);
      this.#textContainer.add(this.#placeholderText);
  
      // Cursor (blinking '|')
      this.#cursor = this.#scene.add.text(0, 0, '|', this.#style)
                                 .setOrigin(0, 0)
                                 .setScrollFactor(0);
      this.#textContainer.add(this.#cursor);
  
      // Pre-allocate letter slots and initial display
      this.preAllocateLetters(this.#content.length);
      this.updateDisplay();
  
      // Keyboard input listener
      this.#scene.input.keyboard.on('keydown', this.#keyListener);
  
      // 3) Blinking cursor timer
      this.#scene.time.addEvent({
        delay: 500,
        loop: true,
        callback: () => {
          this.#cursor.visible = !this.#cursor.visible;
        }
      });
    }
  
    /**
     * Pre-creates text objects to avoid per-frame allocation.
     * @param {number} count - Number of characters to pre-allocate.
     */
    preAllocateLetters(count) {
      for (let i = 0; i < count; i++) {
        const letter = this.#scene.add.text(
          i * this.#charWidth, 0, '',
          { ...this.#style, color: '#00ff00' }
        )
        .setOrigin(0)
        .setScrollFactor(0)
        .setVisible(false);
  
        this.#textContainer.add(letter);
        this.#letterPool.push(letter);
      }
    }
  
    /**
     * Handles key presses: character entry, backspace, and Enter validation.
     * @param {KeyboardEvent} event
     */
    onKeyInput(event) {
      const { key } = event;
  
      switch (key) {
        case 'Backspace':
          this.#inputString = this.#inputString.slice(0, -1);
          break;
  
        case 'Enter':
          if (this.#inputString === this.#content) {
            this._resolveInput(this.#inputString);
            this.cleanup();
          } else {
            this.#onInvalid(this.#inputString);
          }
          return;
  
        default:
          if (key.length === 1 && this.#inputString.length < this.#content.length) {
            this.#inputString += key;
          }
      }
  
      this.updateDisplay();
    }
  
    /**
     * Updates placeholder visibility, letter coloring, and cursor position.
     */
    updateDisplay() {
      const len = this.#inputString.length;
  
      // Show placeholder only when no characters typed
      this.#placeholderText.setVisible(len === 0);
  
      // Render each pre-allocated letter slot
      this.#letterPool.forEach((letterObj, i) => {
        if (i < len) {
          const char     = this.#inputString[i];
          const expected = this.#content[i];
          letterObj
            .setText(char)
            .setFill(char === expected ? '#00ff00' : '#ff0000')
            .setVisible(true)
            .setPosition(i * this.#charWidth, 0);
        } else {
          letterObj.setVisible(false);
        }
      });
  
      // Move cursor to end of typed text (or start if empty)
      this.#cursor.setPosition(len * this.#charWidth, 0);
    }
  
    /**
     * Cleans up graphics, text, and event listeners when done.
     */
    cleanup() {
      this.#scene.input.keyboard.off('keydown', this.#keyListener);
      this.#inputBar.destroy();
      this.#textContainer.destroy();
      this.#container.destroy();
      this.#scene.events.off('update', this.#updateCallback);
      this.#onComplete();
    }
  
    /**
     * Keeps the input bar positioned above the character.
     * @private
     */
    updatePosition() {
      this.#container.setPosition(
        this.#character.x,
        this.#character.y - 200
      );
    }
  }
  