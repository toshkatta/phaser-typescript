class SimpleGame {

    constructor() {
        this.game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: this.preload, create: this.create, update: this.update, collectStar: this.collectStar, playRunningAnimation: this.playRunningAnimation, moveEnemies: this.moveEnemies, hitEnemy: this.hitEnemy });
    }

    game: Phaser.Game;

    preload() {
        this.game.load.image('sky', './assets/sky.png');
        this.game.load.image('ground', './assets/platform.png');
        this.game.load.image('star', './assets/star.png');
        this.game.load.atlas('alucard', './assets/player.png', './assets/player.json');
        this.game.load.spritesheet('enemy', './assets/baddie.png', 32, 32);
    }

    player: Phaser.Sprite;
    platforms: Phaser.Group;
    cursors: Phaser.CursorKeys;
    stars: Phaser.Group;
    score: number;
    scoreText: Phaser.Text;
    enemies: Phaser.Group;
    enemyDirection: boolean = true;

    create() {
        this.game.physics.startSystem(Phaser.Physics.ARCADE);

        this.game.add.sprite(0, 0, 'sky');

        this.platforms = this.game.add.group();
        this.platforms.enableBody = true;
        let ground = this.platforms.create(0, this.game.world.height - 64, 'ground');
        ground.scale.setTo(2, 2);
        ground.body.immovable = true;

        let ledge: Phaser.Sprite = this.platforms.create(400, 510, 'ground');
        ledge.scale.setTo(1, 0.5);
        ledge.body.immovable = true;
        ledge = this.platforms.create(-10, 120, 'ground');
        ledge.body.immovable = true;

        this.player = this.game.add.sprite(37, this.game.world.height - 150, 'alucard');
        this.game.physics.arcade.enable(this.player);
        this.player.body.gravity.y = 1000;
        (this.player.body as Phaser.Physics.Arcade.Body).setSize(25, 50, 20);
        this.player.body.collideWorldBounds = true;

        let startFrames = Phaser.Animation.generateFrameNames('template_', 1, 15, '.png', 2);
        let runFrames = Phaser.Animation.generateFrameNames('template_', 16, 31, '.png', 2);
        this.player.animations.add('run', runFrames, 20, true);
        let startRunningAnimation: Phaser.Animation = this.player.animations.add('startRunning', startFrames, 20, false);
        startRunningAnimation.onComplete.add(this.playRunningAnimation, this);

        this.stars = this.game.add.group();
        this.stars.enableBody = true;
        for (let i = 0; i < 12; i++) {
            let star = this.stars.create(i * 70, 0, 'star');
            star.body.gravity.y = 300;
            star.body.bounce.y = 0.7 + Math.random() * 0.2;
        }

        this.scoreText = this.game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
        this.cursors = this.game.input.keyboard.createCursorKeys();

        this.score = 0;

        this.enemies = this.game.add.group();
        this.enemies.enableBody = true;
        let enemyPositions = [[400, 480], [0, 80]]
        for (let i = 0; i < 2; i++) {
            let enemy: Phaser.Sprite = this.enemies.create(enemyPositions[i][0], enemyPositions[i][1], 'enemy');
            this.game.physics.arcade.enable(enemy);
            enemy.body.gravity.y = 900;
            enemy.body.collideWorldBounds = true;
            enemy.body.velocity.x = 0;
            enemy.animations.add('enemyRunLeft', [0, 1], 10, true);
            enemy.animations.add('enemyRunRight', [2, 3], 10, true);
        }

        this.moveEnemies();
        //this.game.time.events.loop(1000, this.moveEnemies, this);
    }

    collectStar(player, star): void {
        star.kill();
        this.score += 10;
        this.scoreText.text = 'Score: ' + this.score;

    }

    playRunningAnimation(sprite: Phaser.Sprite, animation?): void {
        console.log('stiga')
        sprite.animations.stop();
        sprite.animations.play('run');
    }

    hitEnemy(player, enemy): void {
        player.kill();
        this.scoreText.text = "YOU DIED";
        this.game.state.restart();
    }

    moveEnemies(): void {
        if (this.enemyDirection) {
            this.enemies.callAll('play', null, 'enemyRunLeft');
            this.enemies.setAll('body.velocity.x', -110);
        }
        else {
            this.enemies.callAll('play', null, 'enemyRunRight');
            this.enemies.setAll('body.velocity.x', 110);
        }

        this.enemyDirection = !this.enemyDirection;
        this.game.time.events.add(3000, this.moveEnemies, this)
    }

    update() {
        this.game.physics.arcade.collide(this.player, this.platforms);
        this.game.physics.arcade.collide(this.stars, this.platforms);
        //this.game.physics.arcade.collide(this.player, this.enemies);
        this.game.physics.arcade.collide(this.enemies, this.platforms);

        this.game.physics.arcade.overlap(this.player, this.stars, this.collectStar, null, this);
        this.game.physics.arcade.overlap(this.player, this.enemies, this.hitEnemy, null, this);

        this.player.body.velocity.x = 0;

        if (this.cursors.left.isDown) {
            this.player.scale.setTo(-1, 1);
            this.player.body.velocity.x = -150;
            this.player.animations.play('run');
        }
        else if (this.cursors.right.isDown) {
            this.player.scale.setTo(1, 1);
            this.player.body.velocity.x = 150;
            this.player.animations.play('startRunning', 20, false);
            //console.log(this.player.animations.currentAnim.currentFrame.index === 14);
            //if (this.player.animations.currentAnim.currentFrame.index === 14) {
            //    console.log(14)
            //    this.playRunningAnimation(this.player)
            //}
        }
        else {
            this.player.animations.stop();
            //this.player.animations.play('still', 30, true);
        }

        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.body.velocity.y = -350;
        }

        if (this.cursors.down.isDown && !this.player.body.touching.down) {
            this.player.body.velocity.y = 650;
        }
    }
}

window.onload = () => {
    var game = new SimpleGame();
};