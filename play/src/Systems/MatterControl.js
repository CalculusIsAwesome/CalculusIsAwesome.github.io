export default class MatterControl {
  /**
   * @param {Phaser.Scene} scene
   * @param {Phaser.Physics.Matter.Sprite} player
   * @param {object} [options]
   */
  constructor(scene, player, options = {}) {
    this.scene = scene;
    this.player = player;
    this.pointer = null;
    this.isMouseDown = false;
    this.angle = 0;
    this.magnitude = 0;
    this.state = 'idle';
    this.maxMagnitude = options.maxMagnitude || 150;
    this.maxSpeed = 60;
    this.maxJump = 80;
    this.airControlAccel = 0;
    this.jumpThresholdLeft = -155;
    this.jumpThresholdRight = -25;
    this.pointer = scene.input.activePointer;

    this.graphics = scene.add.graphics()
      .setScrollFactor(0);

    scene.input.on('pointermove', this.handlePointerMove, this);
    scene.input.on('pointerdown', this.handlePointerDown, this);
    scene.input.on('pointerup', this.handlePointerUp, this);
  }

  updateVector() {
    const { x: px, y: py } = this.player.body.position;
    const dx = this.pointer.worldX - px;
    const dy = this.pointer.worldY - py;
    this.angle = Math.atan2(dy, dx);
    this.magnitude = Math.hypot(dx, dy);
  }

  handlePointerMove(pointer) {
    this.updateVector();
  }

  handlePointerDown(pointer) {
    this.isMouseDown = true;
    if (this.scene.isGrounded) {
      const direction = Phaser.Math.RadToDeg(this.angle);
      if (-90 <= direction && direction <= 90) {
        this.player.setFlipX(false)
      } else {
        this.player.setFlipX(true)

      }
      this.applyJump();
    }
  }

  handlePointerUp(pointer) {
    if (!this.isMouseDown) return;
    this.isMouseDown = false;
  }

  applyJump() {
    const deg = Phaser.Math.RadToDeg(this.angle);
    if ((this.jumpThresholdLeft) <= deg && deg <= this.jumpThresholdRight) {

      const magNorm = this.magnitude > this.maxJump ? this.maxJump : this.magnitude;
      const vx = Math.cos(this.angle) * magNorm * 0.01;
      const vy = Math.sin(this.angle) * magNorm * 0.02;
      this.player.applyForce({
        x: vx,
        y: vy
      });
      this.player.play('jump');
      this.state = 'jump';
    }
  }

  _getAim() {
    const p = this.scene.input.activePointer;
    const cam = this.scene.cameras.main;
    const wpt = cam.getWorldPoint(p.x, p.y);
    const dx = wpt.x - this.player.x;
    const dy = wpt.y - this.player.y;
    return {
      angle: Math.atan2(dy, dx),
      mag: Phaser.Math.Distance.Between(this.player.x, this.player.y, wpt.x, wpt.y)
    };
  }

  update() {
    this.graphics.clear();
    const { angle, mag } = this._getAim();

    const p = this.scene.input.activePointer;
    const sx = p.x;
    const sy = p.y;

    this._drawArrow(sx, sy, angle, mag);

    if (!this.scene.isGrounded) {
      this.player.setFriction(1);
      this.player.setFrictionStatic(0);

      if (-10 <= this.player.body.velocity.x && this.player.body.velocity.x <= 10) {
        this.player.applyForce({
          x: Math.cos(this.angle) * 0.2,
          y: 0
        });
      }
    }
    if (this.scene.isGrounded && this.isMouseDown) {
      this.player.setFriction(0.1);
      this.player.setFrictionStatic(0);

      const angle_ = Phaser.Math.RadToDeg(this.angle)
      const direction = -90 <= angle_ && angle_ <= 90 > 0 ? 1 : -1;
      const magnitude = this.magnitude > this.maxSpeed ? this.maxSpeed : this.magnitude;
      this.player.applyForce({
        x: direction * magnitude * 0.001,
        y: 0
      });

      if (this.state != 'walk') {
        this.state = 'walk';
        this.player.play('walk');
      }
    }

    if (this.scene.isGrounded && !this.isMouseDown) {
      this.updateVector();
      this.player.setFriction(1);
      this.player.setFrictionStatic(10);
      
      if (this.state != 'idle') {
        this.state = 'idle';
        this.player.play('idle');
      }

    }

  }

  _drawArrow(wx, wy, angle, mag) {
    const color = 0xcc77cc;
    const alpha = 0.9;
    const tailLen = Phaser.Math.Clamp(mag / 5, 0, this.maxMagnitude);
    const headSz = 12;

    const ux = Math.cos(angle);
    const uy = Math.sin(angle);

    const tailX = wx - ux * tailLen;
    const tailY = wy - uy * tailLen;

    const baseX = wx - ux * headSz;
    const baseY = wy - uy * headSz;

    this.graphics
      .lineStyle(8, color, alpha)
      .beginPath()
      .moveTo(tailX, tailY)
      .lineTo(baseX, baseY)
      .strokePath();

    const perpX = -uy;
    const perpY = ux;
    const leftX = baseX + perpX * (headSz / 2);
    const leftY = baseY + perpY * (headSz / 2);
    const rightX = baseX - perpX * (headSz / 2);
    const rightY = baseY - perpY * (headSz / 2);

    this.graphics
      .fillStyle(color, alpha)
      .beginPath()
      .moveTo(wx, wy)
      .lineTo(leftX, leftY)
      .lineTo(rightX, rightY)
      .closePath()
      .fillPath();
  }
}
