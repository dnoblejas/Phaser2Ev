const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let player;
let cursors;
let obstacles;  // Grupo de todos los obstáculos (planetas, bloques, cohetes)
let blueBalls;  // Grupo de las bolas azules
let score = 0;
let scoreText;
let gameOverFlag = false;
let victoryFlag = false; // Variable para controlar si el jugador gana el juego

// Cargar los recursos (imágenes)
function preload() {
    this.load.image('sky', 'https://labs.phaser.io/assets/skies/space3.png');
    this.load.image('ship', 'https://labs.phaser.io/assets/sprites/shmup-ship.png');
    this.load.image('planet', 'https://labs.phaser.io/assets/sprites/planet.png'); // Planeta
    this.load.image('block', 'https://labs.phaser.io/assets/sprites/block.png'); // Bloque
    this.load.image('rocket', 'https://labs.phaser.io/assets/sprites/rocket.png'); // Cohete
    this.load.image('blueBall', 'https://labs.phaser.io/assets/sprites/blue_ball.png'); // Bola azul
    this.load.image('explosion', 'https://labs.phaser.io/assets/sprites/explosion.png'); // Explosión (cuando colisiona)
}

// Crear el juego
function create() {
    // Fondo
    this.add.image(400, 300, 'sky');

    // Jugador
    player = this.physics.add.image(400, 500, 'ship');
    player.setCollideWorldBounds(true); // La nave no puede salir del mundo

    // Movimiento del jugador
    cursors = this.input.keyboard.createCursorKeys();

    // Grupos de obstáculos
    obstacles = this.physics.add.group();  // Para planetas, bloques y cohetes
    blueBalls = this.physics.add.group();  // Para las bolas azules

    // Crear obstáculos azules (bolas)
    for (let i = 0; i < 10; i++) {
        let x = Phaser.Math.Between(50, 750);
        let y = Phaser.Math.Between(-150, -50);
        let ball = blueBalls.create(x, y, 'blueBall');
        ball.setScale(0.5); // Asegurarse de que las bolas sean grandes
        ball.setVelocityY(Phaser.Math.Between(100, 200));
        ball.setVelocityX(Phaser.Math.Between(-50, 50));
    }

    // Crear obstáculos aleatorios (planetas, bloques y cohetes)
    for (let i = 0; i < 10; i++) {
        let x = Phaser.Math.Between(50, 750);
        let y = Phaser.Math.Between(-150, -50);
        let type = Phaser.Math.Between(0, 2); // Elegir aleatoriamente entre 0, 1 o 2

        let obstacle;
        if (type === 0) {
            obstacle = obstacles.create(x, y, 'planet');
        } else if (type === 1) {
            obstacle = obstacles.create(x, y, 'block');
        } else {
            obstacle = obstacles.create(x, y, 'rocket');
        }

        // Aseguramos que los obstáculos sean mucho más grandes
        obstacle.setScale(0.5);
        obstacle.setVelocityY(Phaser.Math.Between(100, 200)); // Velocidad hacia abajo
        obstacle.setVelocityX(Phaser.Math.Between(-50, 50)); // Velocidad aleatoria en el eje X
    }

    // Colisión entre el jugador y los obstáculos
    this.physics.add.collider(player, obstacles, gameOver, null, this);
    this.physics.add.collider(player, blueBalls, gameOver, null, this);

    // Texto del puntaje
    scoreText = this.add.text(16, 16, 'Puntaje: 0', {
        fontSize: '32px',
        fill: '#fff'
    });
}

// Actualizar el juego
function update() {
    // Movimiento de la nave
    if (cursors.left.isDown) {
        player.setVelocityX(-160);
    }
    else if (cursors.right.isDown) {
        player.setVelocityX(160);
    }
    else {
        player.setVelocityX(0);
    }

    if (cursors.up.isDown) {
        player.setVelocityY(-160);
    }
    else if (cursors.down.isDown) {
        player.setVelocityY(160);
    }
    else {
        player.setVelocityY(0);
    }

    // Aumentar el puntaje
    if (!gameOverFlag && !victoryFlag) {
        score += 0.1;
        scoreText.setText('Puntaje: ' + Math.floor(score));
    }

    // Verificar si el jugador ha ganado
    if (score >= 150 && !victoryFlag) {
        victoryFlag = true;
        // Pausar la física y mostrar el mensaje de victoria
        this.physics.pause();
        scoreText.setText('¡Has Ganado!\nPuntaje: ' + Math.floor(score));
    }

    // Reposicionar obstáculos (planetas, bloques y cohetes) que se salen de la pantalla
    obstacles.children.iterate(function (child) {
        if (child.y > 600) {
            child.setY(Phaser.Math.Between(-150, -50));
            child.setX(Phaser.Math.Between(50, 750));
            child.setVelocityY(Phaser.Math.Between(100, 200));
            child.setVelocityX(Phaser.Math.Between(-50, 50));
        }
    });

    // Reposicionar bolas azules que se salen de la pantalla
    blueBalls.children.iterate(function (child) {
        if (child.y > 600) {
            child.setY(Phaser.Math.Between(-150, -50));
            child.setX(Phaser.Math.Between(50, 750));
            child.setVelocityY(Phaser.Math.Between(100, 200));
            child.setVelocityX(Phaser.Math.Between(-50, 50));
        }
    });
}

// Fin del juego con retraso
function gameOver(player, obstacle) {
    gameOverFlag = true; // Marcar que el juego terminó

    // Pausar física
    this.physics.pause();

    // Cambiar el color del jugador a rojo
    player.setTint(0xff0000);

    // Mostrar mensaje de fin de juego
    scoreText.setText('Juego Terminado\nPuntaje: ' + Math.floor(score));

    // Mostrar una explosión
    let explosion = this.add.sprite(player.x, player.y, 'explosion');
    explosion.setScale(0.5); // Ajustar el tamaño de la explosión
    explosion.play('explode'); // Animar la explosión
    this.time.delayedCall(500, () => {
        explosion.setVisible(false); // Esconder la explosión después de un tiempo
    });

    // Esperar 2 segundos antes de reiniciar el juego
    this.time.delayedCall(2000, restartGame, [], this); // 2000ms = 2 segundos
}

// Función para reiniciar el juego
function restartGame() {
    // Limpiar la escena y reiniciar la puntuación
    score = 0;
    scoreText.setText('Puntaje: 0');

    // Eliminar objetos y volver a crear la escena
    this.scene.restart();
    gameOverFlag = false; // Restablecer la bandera de fin de juego
    victoryFlag = false; // Restablecer la bandera de victoria
}
