export function Jumpingjack(canvas) {
  new logics(gameobjects(canvas));
}

class logics {
  interval = null;
  animations = [];
  constructor(private gobject) {
    this.frameupdate();
    const inputAction = () => {
      const { game, obstacle, player } = gobject;
      if (!game.over) this.actions.jump();
      else {
        game.over = false;
        game.score = 0;
        game.speed = game.initialspeed;
        obstacle.container = [Object.assign({}, obstacle.element)];
        player.x = player.initialpos.x;
        player.y = player.initialpos.y;
        this.actions.updatespec(false);
        this.setupdatespeed();
      }
    };

    ['keydown', 'click'].forEach((eventType) =>
      document.addEventListener(eventType, (e) => {
        inputAction();
      })
    );
    this.animations = animationgenerator(gobject);
  }

  setupdatespeed() {
    const { game } = this.gobject;
    this.interval && clearInterval(this.interval);
    const speedfactor = 1 + Math.pow(2, -game.score / 100);

    this.interval = setInterval(
      () => this.update(this.gobject),
      speedfactor * game.speed
    );
  }

  frameupdate() {
    requestAnimationFrame(() => this.frameupdate());
    if (this.gobject.canvas.context && !this.gobject.game.over) {
      this.render(this.gobject);
    }
  }

  actions = {
    jump: () => {
      const { player } = this.gobject;
      if (player.actions.jump.done) {
        player.actions.jump.done = false;
        player.actions.jump.y = -50;
      }
    },
    jumpstate: () => {
      const { player, canvas } = this.gobject;
      if (!player.actions.jump.done) {
        player.y += player.actions.jump.y / 100;
        player.actions.jump.y++;
        if (player.y >= canvas.height - player.height) {
          player.y = canvas.height - player.height;
          player.actions.jump.done = true;
        }
      }
    },
    hit: () => {
      const { player, obstacle } = this.gobject;
      const xplayer = player.x + player.height;
      const yplayer = player.y + player.width;
      if (
        obstacle.container.some(
          (e) =>
            e.x <= xplayer &&
            e.x + e.width >= player.x &&
            e.y + e.height >= player.y &&
            e.y <= yplayer
        )
      ) {
        this.actions.updatespec(true);
      }
    },
    gc: () => {
      const { obstacle } = this.gobject;
      obstacle.container.forEach((o) => {
        if (o.x < -o.width) {
          this.actions.destroyandcreatenew();
        } else o.x -= 0.5;
      });
    },
    destroyandcreatenew: () => {
      const { obstacle, canvas, game } = this.gobject;
      obstacle.container.pop();
      const height = this.utility.randomrange(10, 4);
      const obs = {
        x: this.utility.randomrange(70, 50),
        width: this.utility.randomrange(6, 1),
        height: height,
        y: canvas.height - height,
      };
      obstacle.container.push(obs);
      game.score += 1;
      this.actions.updatespec(false);
      this.setupdatespeed();
    },
    updatespec: (gameover) => {
      const { game, canvas } = this.gobject;
      if (gameover) {
        game.over = true;
        canvas.HUD.innerText = `GAME-OVER | score:${game.score} | highscore:${game.highscore}`;
        return;
      }
      game.score > game.highscore && (game.highscore = game.score);
      canvas.HUD.innerText = `score:${game.score} | highscore:${game.highscore}`;
    },
  };

  utility = {
    randomrange: function (max, min) {
      return Math.floor(Math.random() * (max - min) + min);
    },
  };

  count = 0;
  update({ obstacle }) {
    if (this.gobject.game.over) return;
    if (this.count < 10) {
      this.count++;
    }
    obstacle.x -= 0.25;
    this.actions.jumpstate();
    this.actions.hit();
    this.actions.gc();
  }

  render({ canvas, obstacle }) {
    canvas.context.clearRect(0, 0, canvas.width, canvas.height);
    this.animations.forEach((e) => e());
    [...obstacle.container].forEach((e) =>
      canvas.context.fillRect(e.x, e.y, e.width, e.height)
    );
  }
}

function gameobjects(canvas: {
  element: any;
  context: CanvasRenderingContext2D;
  width: number;
  height: number;
  HUD: HTMLElement;
}) {
  return {
    firstframe: 0,
    canvas: {
      element: canvas,
      context: canvas.context,
      x: 0,
      y: 0,
      width: canvas.width,
      height: canvas.height,
      HUD: canvas.HUD,
    },
    player: {
      initialpos: { x: canvas.width / 5, y: canvas.height - 11 },
      x: 0,
      y: 0,
      width: 10,
      height: 11,
      actions: {
        jump: {
          limit: 15,
          speed: 1,
          y: 0,
          limitreched: false,
          done: true,
        },
        damage: {},
      },
    },
    obstacle: {
      container: [{ x: 50, y: 45, width: 10, height: 5 }],
      element: {
        x: 50,
        y: 45,
        width: 5,
        height: 5,
      },
    },
    game: {
      spec: null,
      speed: 5,
      initialspeed: 5,
      score: 0,
      highscore: 0,
      over: true,
    },
  };
}

function animationgenerator({ canvas, player, firstframe }) {
  return [
    () => {
      const pixels = [
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 1, 1, 1, 1, 0, 1, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
      ];
      const height = pixels.length;
      if (firstframe > 10) {
        firstframe = 0;
      }
      firstframe++;

      if (firstframe < 5) {
        pixels[height - 2] = [0, 1, 0, 0, 0, 0, 0, 1, 0, 0];
        pixels[height - 1] = [0, 1, 1, 0, 0, 0, 0, 1, 1, 0];
      } else {
        pixels[height - 2] = [0, 0, 1, 0, 0, 0, 1, 0, 0, 0];
        pixels[height - 1] = [0, 0, 1, 1, 0, 0, 1, 1, 0, 0];
      }

      pixels.forEach((rows, i) => {
        rows.forEach((pixel, j) => {
          pixel && canvas.context.fillRect(player.x + j, player.y + i, 1, 1);
        });
      });
    },
  ];
}
