import LoadUI from "../UI/LoadUI.js"
import MatterControl from "../Systems/MatterControl.js"
import DialogueManager from "../Systems/Dialogue/DialogueManager.js";

export default class MatterLevel extends Phaser.Scene {
    constructor(config) {
        if (typeof (config) === 'string') {
            const default_config = {
                key: config,
                physics: {
                    default: 'matter',
                    matter: {
                        gravity: { y: 1 },
                        debug: false
                    }
                }
            }
            super(default_config);
        } else {
            super(config);
        }
    }

    preload() {
        new LoadUI(this).rendor();
    }

    createAnimations() {
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('idle', { start: 0, end: 0 }),
            frameRate: 1,
            repeat: -1
        });

        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('walk', { start: 0, end: 6 }),
            frameRate: 6,
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            frames: this.anims.generateFrameNumbers('jump', { start: 0, end: 7 }),
            frameRate: 5,
            repeat: -1
        });

        this.anims.create({
            key: 'cat-idle',
            frames: this.anims.generateFrameNumbers('cat-idle', { start: 0, end: 7 }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'cat-walk',
            frames: this.anims.generateFrameNumbers('cat-walk', { start: 0, end: 11 }),
            frameRate: 11,
            repeat: -1
        });
    }

    createBackground() {
        this.add.image(640, 360, "bridge").setScale(1.2);
    }

    createPlayer() {
        let [x, y] = this.addPlayer();
        let compound = this.createGroundSensor();
        this.player
            .setExistingBody(compound)
            .setFixedRotation(false)
            .setPosition(x, y);

    }

    addPlayer(x = 600, y = 600) {
        this.player = this.matter.add.sprite(x, y, 'idle');
        return [x, y]
    }

    createGroundSensor() {
        this.groundContacts = new Set();
        const { Bodies, Body } = Phaser.Physics.Matter.Matter;
        const w = this.player.width, h = this.player.height;

        const mainBody = Bodies.rectangle(0, 0, w, h, { chamfer: { radius: 10 } });

        this.groundSensor = Bodies.rectangle(0, h * 0.5 + 1, w, 2, {
            isSensor: true,
            label: 'groundSensor'
        });

        const compound = Body.create({ parts: [mainBody, this.groundSensor], friction: 0.1, frictionAir: 0.02 });

        this.matter.world.on('collisionstart', ({ pairs }) => {
            for (let p of pairs) {
                if (p.bodyA === this.groundSensor && !p.bodyB.isSensor) this.groundContacts.add(p.bodyB);
                if (p.bodyB === this.groundSensor && !p.bodyA.isSensor) this.groundContacts.add(p.bodyA);
            }
        });
        this.matter.world.on('collisionend', ({ pairs }) => {
            for (let p of pairs) {
                if (p.bodyA === this.groundSensor) this.groundContacts.delete(p.bodyB);
                if (p.bodyB === this.groundSensor) this.groundContacts.delete(p.bodyA);
            }
        });

        return compound;
    }

    createCharacters() {
        this.pet = this.matter.add.sprite(100, 680, 'cat-idle', 0, {
            shape: { type: 'rectangle', width: 20, height: 30 }
        })
            .setScale(2.5)
            .setFixedRotation(false)
            .setFrictionAir(0.1)
            .play('cat-idle');
        this.pet.setFrictionStatic(0);
        this.pet.setFriction(0);
        const DEAD_ZONE = 200;
        const K = 0.05;
        const MAX_FORCE = 0.005;

        this.events.on('update', () => {
            const dx = this.player.x - this.pet.x;
            let forceX = 0;

            if (dx > DEAD_ZONE) {
                forceX = Math.min((dx - DEAD_ZONE) * K, MAX_FORCE);
            } else if (dx < -DEAD_ZONE) {
                forceX = Math.max((dx + DEAD_ZONE) * K, -MAX_FORCE);
            }

            if (forceX !== 0) {
                this.pet.applyForce({ x: forceX, y: 0 });
            }

            const vx = this.pet.body.velocity.x;
            if (Math.abs(vx) > 0.05) {
                this.pet.anims.play('cat-walk', true);
                this.pet.setFlipX(vx > 0);
            } else {
                this.pet.anims.play('cat-idle', true);
            }
        });
    }


    createfloor() {
        this.floors = [];

        this.floorCategory = this.matter.world.nextCategory();
        this.petCategory = this.matter.world.nextCategory();

    }

    registerFloor(body) {
        if (body.setCollisionCategory) {
            // Phaser Matter GameObject
            body.setCollisionCategory(this.floorCategory);
        } else if (body.collisionFilter) {
            // raw Matter.Body
            body.collisionFilter.category = this.floorCategory;
        }
        this.floors.push(body);
    }

    setPetCollision() {
        this.pet.setCollisionCategory(this.petCategory);
        this.pet.setCollidesWith(this.floorCategory);
    }

    createCamera() {
        this.cameras.main.startFollow(this.player, false, 0.2, 0.2);
        this.cameras.main.setBounds(-900, -500, this.scale.width * 2.4, this.scale.height * 2);

    }

    createLevel() {
        throw new Error(
            `${this.constructor.name} must implement createLevel()`
        );
    }

    createOverlay() { }

    createControls() {
        this.control = new MatterControl(this, this.player);
    }

    createDialogue() {
        this.dialogueManager = new DialogueManager(this);
    }

    setPlayerState(state) {
        this.player.play(state);
    }

    registerLevel(level) {
        const entranceText = this.add
            .text(level[1], level[2], 'Enter ' + level[0], {
                fontSize: '16px',
                fill: '#fff',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                padding: { x: 10, y: 10 }
            })
            .setOrigin(0.5)
            .setVisible(false);

        const zone = this.add
            .zone(level[1], level[2], level[3], level[4])
            .setOrigin(0)
            .setInteractive({ cursor: 'pointer' });

        zone.on('pointerover', (pointer) => {
            entranceText.setVisible(true);
        });

        zone.on('pointerout', (pointer) => {
            entranceText.setVisible(false);
        });

        zone.on('pointermove', (pointer) => {
            entranceText.setX(pointer.worldX);
            entranceText.setY(pointer.worldY);
        });

        zone.on('pointerdown', (pointer) => {
            this.scene.start(level[0]);
        });
    }

    create() {
        this.createAnimations();
        this.createBackground();
        this.createPlayer();
        this.createCamera();
        this.createCharacters();
        this.createfloor();
        this.createDialogue();
        this.createLevel();
        this.setPetCollision();
        this.createOverlay();
        this.createControls();
        this.setPlayerState('idle');
    }

    updateGroundedFlag() {
        this.isGrounded = this.groundContacts.size > 0;
    }

    update(time, deta) {
        this.updateGroundedFlag();
        this.control.update();
    }
}