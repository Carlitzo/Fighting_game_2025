export function startGame() {
    const config = {
        type: Phaser.AUTO,
        width: window.innerWidth,
        height: window.innerHeight,
        physics: {
            default: "arcade",
            arcade: { gravity: { y: 1200}, debug: true}
        },
        scene: { preload, create, update}
    }
    
    function preload() {
        this.load.image("background", "./../assets/images/BG_main_menu.png");
        this.load.image("ground", "./../assets/maps/platform.png");
        this.load.spritesheet("playerIdle", "./../assets/sprites/playerIdle.png", {
            frameWidth: 128,
            frameHeight: 128
        });
        this.load.spritesheet("enemyIdle", "./../assets/sprites/enemyIdle.png", {
            frameWidth: 128,
            frameHeight: 128
        });
    }
    
    let player;
    let enemy;
    let ground;
    let playerJumpCount = 0;
    let enemyJumpCount = 0;
    let enemyIsAttacking = false;


    function create() {
        this.add.image(window.innerWidth / 2, window.innerHeight / 2, "background")
        .setDisplaySize(window.innerWidth, window.innerHeight);

        ground = this.physics.add.staticImage(
            window.innerWidth / 2,
            window.innerHeight, 
            "ground"
          ).setScale(3.7).refreshBody();
          
        player = this.physics.add.sprite(100,100, "playerIdle");
        player.setCollideWorldBounds(true);
        player.setScale(1.2);
        player.setSize(64, 128);

        enemy = this.physics.add.sprite(600,100, "enemyIdle");
        enemy.setCollideWorldBounds(true);
        enemy.setScale(1.2);
        enemy.setSize(64, 128)
        
        this.physics.add.collider(player, ground, () => {
            if (player.body.touching.down) {
                playerJumpCount = 0;
            }
        })

        this.physics.add.collider(enemy, ground, () => {
            if (enemy.body.touching.down) {
                enemyJumpCount = 0;
            }
        })

        this.anims.create({
            key: "playerIdle",
            frames: this.anims.generateFrameNumbers("playerIdle", { start: 0, end: 4 }),
            frameRate: 8,  // Testa olika frameRate-värden (t.ex. 6, 8, 12)
            repeat: -1  // -1 gör att den loopar oändligt
        });

        this.anims.create({
            key: "enemyIdle",
            frames: this.anims.generateFrameNumbers("enemyIdle", { start: 0, end: 8 }),
            frameRate: 8,  // Testa olika frameRate-värden (t.ex. 6, 8, 12)
            repeat: -1  // -1 gör att den loopar oändligt
        });

        // this.anims.create({
        //     key: "enemyAttack",
        //     frames: this.anims.generateFrameNumbers("enemyAttack", { start:0, end: 7}),
        //     frameRate: 12,
        //     repeat: 0
        // })

        player.play("playerIdle");
        enemy.play("enemyIdle");
    }

    function update() {
        const leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        const rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        const upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        const downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);

        const Y = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
    
        const W = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        const A = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        const S = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        const D = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    
        const X = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    
        if (player.body.blocked.down) {
            playerJumpCount = 0;
        }
    
        if (leftKey.isDown) {
            player.setVelocityX(-200);
            player.setFlipX(true);
        } else if (rightKey.isDown) {
            player.setVelocityX(200);
            player.setFlip(false);
        } else {
            player.setVelocityX(0);
        }
    
        if (Phaser.Input.Keyboard.JustDown(upKey) && playerJumpCount < 2) {
            player.setVelocityY(-400);
            playerJumpCount++;
        }
    
        if (downKey.isDown) {
            player.setVelocityY(0);
        }
    
        if (player.body.velocity.x === 0 && player.body.velocity.y === 0) {
            player.play("playerIdle", true);
        }
    
        if (enemy.body.blocked.down) {
            enemyJumpCount = 0;
        }
    
        if (!enemyIsAttacking) { // Se till att fienden bara kan röra sig om den INTE attackerar
            if (A.isDown) {
                enemy.setVelocityX(-200);
                enemy.setFlipX(true);
            } else if (D.isDown) {
                enemy.setVelocityX(200);
                enemy.setFlip(false);
            } else {
                enemy.setVelocityX(0);
            }
    
            if (Phaser.Input.Keyboard.JustDown(W) && enemyJumpCount < 100000) {
                enemy.setVelocityY(-400);
                enemyJumpCount++;
            }
    
            if (S.isDown) {
                enemy.setVelocityY(0);
            }
    
            if (
                enemy.body.velocity.x === 0 &&
                enemy.body.velocity.y === 0 &&
                enemy.anims.currentAnim.key !== "enemyAttack"
            ) {
                enemy.play("enemyIdle", true);
            }
        }
    
        if (Phaser.Input.Keyboard.JustDown(X) && !enemyIsAttacking) {
    
            enemyIsAttacking = true;
            enemy.stop();
            enemy.setVelocityX(0);
            enemy.setVelocityY(0);
    
            enemy.play("enemyAttack");
    
            enemy.once("animationcomplete", (animation) => {
                if (animation.key === "enemyAttack") {
                    enemyIsAttacking = false;
                    enemy.play("enemyIdle");
                }
            });
        }
    }
    
    
    var game = new Phaser.Game(config);
}