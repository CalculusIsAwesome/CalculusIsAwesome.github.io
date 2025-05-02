export default class ArcadeControl {
  constructor(scene, sprite, config = {}) {
    this.scene = scene;
    this.sprite = sprite;
    this.sprite.setMaxVelocity(10000, 10000);

    this.config = Object.assign({
      acceleration: 600,
      xThreshold: 5,
      jumpThresholdAngle: -0.436,
      jumpSpeed: 2000,
      jumpPowerFactor: 10,
      minJumpSpeed: 400,
      maxJumpSpeed: 700,
      airControlVerticalFactor: 0.4,
      airControlDelay: 0,
      arrowWidth: 15,
      arrowHeight: 20,
      tailScale: 5,
      minTailForText: 30,
      textOffset: 12,
      alpha: 0.4,
      colors: {
        jump: { value: 0x23c17f, label: "JUMP" },
        down: { value: 0xe3d159, label: "DOWN" },
        walk: { value: 0x4b84db, label: "WALK" },
      },
      textStyle: { font: "10px Arial", color: "#ffffff" }
    }, config);

    this.jumpTime = 0;
    this.targetX = sprite.x;
    this.targetY = sprite.y;
    this.angle = 0;
    this.magnitude = 0;

    this.arrowGraphic = this.scene.add.graphics();
    this.arrowText = this.scene.add.text(0, 0, "", this.config.textStyle);
    this.arrowText.setOrigin(0.5, 0.5);

    // ✨ Draw in screen space:
    this.arrowGraphic.setScrollFactor(0);
    this.arrowText.setScrollFactor(0);

    this.scene.input.on("pointerdown", this.handlePointerDown, this);
    this.scene.input.on("pointermove", this.handlePointerMove, this);
    this.scene.input.on("pointerup", this.handlePointerUp, this);
  }

  handlePointerDown(pointer) {
    this.updatePointer(pointer);
    if (
      this.sprite.body &&
      this.sprite.body.touching.down &&
      this.angle < this.config.jumpThresholdAngle
    ) {
      let rawPower = this.magnitude * this.config.jumpPowerFactor;
      const jumpPower = Phaser.Math.Clamp(
        rawPower,
        this.config.minJumpSpeed,
        this.config.maxJumpSpeed
      );

      const vx = Math.cos(this.angle) * 1.3 * jumpPower;
      const vy = Math.sin(this.angle) * 1.3 * jumpPower;
      this.sprite.setVelocity(vx, vy);
      this.jumpTime = this.scene.time.now;
    }

    this.drawArrow();
  }

  handlePointerMove(pointer) {
    this.updatePointer(pointer);
    this.drawArrow();
  }

  handlePointerUp(pointer) {
    this.drawArrow();
  }

  updatePointer(pointer) {
    const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
    this.targetX = worldPoint.x;
    this.targetY = worldPoint.y;
    this._calculateDirection();
  }

  _calculateDirection() {
    const dx = this.targetX - this.sprite.x;
    const dy = this.targetY - this.sprite.y;
    this.angle = Math.atan2(dy, dx);
    this.magnitude = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, this.targetX, this.targetY);
  }

  update() {
    const pointer = this.scene.input.activePointer;
    this.updatePointer(pointer);

    if (!this.sprite.body) return;

    const touchingDown = this.sprite.body.touching.down;

    if (touchingDown && !this.wasTouchingDown) {
      this.airControlActive = false;
    }
    this.wasTouchingDown = touchingDown;

    const dx = this.targetX - this.sprite.x;
    const dy = this.targetY - this.sprite.y;

    const maxHorizontalSpeed = 300;
    const desiredVX = Phaser.Math.Clamp(dx * 2, -maxHorizontalSpeed, maxHorizontalSpeed);
    const smoothing = 0.9;
    const currentVX = this.sprite.body.velocity.x;
    const newVX = Phaser.Math.Interpolation.Linear([currentVX, desiredVX], smoothing);

    if (touchingDown) {
      if ((pointer.isDown || this.airControlActive) && Math.abs(dx) > this.config.xThreshold) {
        this.sprite.setVelocityX(newVX);
      } else {
        this.sprite.setVelocityX(0);
      }
    } else {
      this.sprite.setVelocityX(newVX);
      if (dy > 0) {
        const boost = Phaser.Math.Clamp(dy * 0.05, 0, 200);
        this.sprite.setVelocityY(this.sprite.body.velocity.y + boost);
      }
    }

    this.drawArrow();
  }

  drawArrow() {
    const { arrowWidth, arrowHeight, tailScale, minTailForText, textOffset, alpha, colors } = this.config;
    const tailLength = this.magnitude / tailScale;
    const angleDeg = Phaser.Math.RadToDeg(this.angle);
    let fillColor, textLabel;

    if (angleDeg < -25 && angleDeg > -155) {
      fillColor = colors.jump.value;
      textLabel = colors.jump.label;
    } else if (angleDeg > 60 && angleDeg < 120) {
      fillColor = colors.down.value;
      textLabel = colors.down.label;
    } else {
      fillColor = colors.walk.value;
      textLabel = colors.walk.label;
    }

    const px = this.scene.input.activePointer.x;
    const py = this.scene.input.activePointer.y;
    const rotation = this.angle + Math.PI;

    this.arrowGraphic.setPosition(px, py);
    this.arrowGraphic.setRotation(rotation);
    this.arrowGraphic.clear();
    this.arrowGraphic.fillStyle(fillColor, alpha);

    this.arrowGraphic.fillRect(
      tailLength + arrowWidth,
      -(arrowHeight * 0.6) / 2,
      -tailLength,
      arrowHeight * 0.6
    );

    this.arrowGraphic.beginPath();
    this.arrowGraphic.moveTo(0, 0);
    this.arrowGraphic.lineTo(arrowWidth, arrowHeight / 2);
    this.arrowGraphic.lineTo(arrowWidth, -arrowHeight / 2);
    this.arrowGraphic.closePath();
    this.arrowGraphic.fillPath();

    if (tailLength > minTailForText) {
      const textOffsetX = tailLength / 2 + textOffset;
      const offsetX = textOffsetX * Math.cos(rotation);
      const offsetY = textOffsetX * Math.sin(rotation);
      this.arrowText.setText(textLabel);
      this.arrowText.setPosition(px + offsetX, py + offsetY);
      const rotationDeg = Phaser.Math.RadToDeg(rotation);
      this.arrowText.setAngle((rotationDeg >= 90 && rotationDeg <= 270) ? rotationDeg + 180 : rotationDeg);
      this.arrowText.setAlpha(1);
    } else {
      this.arrowText.setText("");
    }
  }
}
