export class Jaggedrunner {
  constructor(canvas) {
    new logics(new gameobjects(canvas));
  }
}

class logics {
  interval = null;
  constructor(private gobject: gameobjects) {
    this.frameupdate();
    const inputAction = () => {
      if (!gobject.game.over) this.actions.jump();
      else {
        gobject.game.over = false;
        gobject.game.score = 0;
        gobject.game.speed = gobject.game.initialspeed;
        gobject.player.x = gobject.player.initialpos.x;
        gobject.player.y = gobject.player.initialpos.y;
        gobject.obstacle.container = Array(2)
          .fill(1)
          .map((e, i) => ({
            x: gobject.canvas.width * i,
            y: this.gobject.player.y + this.gobject.player.height,
          })) as any;
        this.actions.updatespec(false);
        this.setupdatespeed();
      }
    };

    ['keydown', 'click'].forEach((eventType) =>
      document.addEventListener(eventType, (e) => {
        inputAction();
      })
    );
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
    if (this.gobject.canvas.context) {
      this.render(this.gobject);
    }
  }

  actions = {
    jump: () => {
      const { player, obstacle } = this.gobject;
      const diff = player.y + player.height - obstacle.container[1].y;
      if (diff == 0) {
        this.actions.updatespec(true);
        return;
      }
      const diffclammped = Math.abs(diff) / diff;
      player.y -= diffclammped * player.actions.jump.step;
      obstacle.container[0].y -= diffclammped * player.actions.jump.step;
    },
    jumpstate: () => {
      const { player, canvas } = this.gobject;
      if (!player.actions.jump.done) {
        player.y += player.actions.jump.y / 100;
        player.actions.jump.y++;
        if (player.y >= canvas.height - player.pixels.length) {
          player.y = canvas.height - player.pixels.length;
          player.actions.jump.done = true;
        }
      }
    },
    newHeight: () => {
      return (
        this.gobject.canvas.height -
        this.gobject.player.actions.jump.step *
          this.utility.randomrange(
            this.gobject.obstacle.element.heightDevience,
            1
          )
      );
    },
    hit: () => {
      const { player, obstacle } = this.gobject;
      const xplayer = player.x + player.width;
      const yplayer = player.y + player.height;
      const obs = obstacle.container[1];
      if (obs.x <= xplayer && obs.y != yplayer) {
        this.actions.updatespec(true);
      }
    },
    gc: () => {
      const { obstacle, canvas, game } = this.gobject;
      obstacle.container.forEach((o, i) => {
        if (o.x < -1 * canvas.width) {
          const selection = obstacle.container.shift();
          selection.x = obstacle.container[0].x + canvas.width;
          selection.y = this.actions.newHeight();
          this.gobject.obstacle.container.push(selection);
          this.actions.updatespec(false);
          game.score += 1;
          this.setupdatespeed();
        } else o.x -= 0.5;
      });
    },

    updatespec: (gameover) => {
      if (gameover) {
        this.gobject.game.over = true;
        this.gobject.canvas.HUD.innerText = `GAME-OVER | score:${this.gobject.game.score} | highscore:${this.gobject.game.highscore}`;
        return;
      }
      this.gobject.game.score > this.gobject.game.highscore &&
        (this.gobject.game.highscore = this.gobject.game.score);
      this.gobject.canvas.HUD.innerText = `score:${this.gobject.game.score} | highscore:${this.gobject.game.highscore}`;
    },
  };

  utility = {
    randomrange: function (max, min) {
      return Math.floor(Math.random() * (max - min) + min);
    },
  };

  count = 0;
  update({ obstacle, parser }) {
    if (this.gobject.game.over) return;
    if (this.count < 10) {
      this.count++;
    }
    obstacle.x -= 0.25;
    this.actions.jumpstate();
    this.actions.hit();
    this.actions.gc();
    parser.playerwalkanim();
  }

  render({ canvas, player, obstacle }: gameobjects) {
    canvas.context.clearRect(0, 0, canvas.width, canvas.height);
    const drawplayer = (player) => {
      player.pixels.forEach((rows, i) => {
        rows.forEach((pixel, j) => {
          pixel && canvas.context.fillRect(player.x + j, player.y + i, 1, 1);
        });
      });
    };
    drawplayer(player);
    obstacle.container.forEach((e) =>
      canvas.context.fillRect(e.x, e.y, canvas.width, canvas.height - e.y)
    );
  }
}

class gameobjects {
  constructor(canvas: {
    element: any;
    context: CanvasRenderingContext2D;
    width: number;
    height: number;
    HUD: HTMLElement;
  }) {
    this.canvas = { ...this.canvas, ...canvas };
    [canvas.element.width, canvas.element.height] = [
      this.canvas.width,
      this.canvas.height,
    ];
    this.player.width = this.player.pixels[0].length;
    this.player.height = this.player.pixels.length;
    this.player.initialpos = {
      x: this.canvas.width / 2 - this.player.width * 1.5,
      y: this.canvas.height - this.player.height - 4,
    };
  }

  firstframe = 0;

  parser = {
    playerwalkanim: () => {
      const pix = this.player.pixels;
      const height = this.player.pixels.length;
      if (this.firstframe > 10) {
        this.firstframe = 0;
      }
      this.firstframe++;

      if (this.firstframe < 5) {
        pix[height - 2] = [0, 1, 0, 0, 0, 0, 0, 1, 0, 0];
        pix[height - 1] = [0, 1, 1, 0, 0, 0, 0, 1, 1, 0];
      } else {
        pix[height - 2] = [0, 0, 1, 0, 0, 0, 1, 0, 0, 0];
        pix[height - 1] = [0, 0, 1, 1, 0, 0, 1, 1, 0, 0];
      }
    },
  };

  canvas = {
    element: null,
    context: null,
    x: 0,
    y: 0,
    width: 100,
    height: 50,
    HUD: null,
  };
  player = {
    initialpos: { x: 10, y: 30 },
    x: 10,
    y: 40,
    width: 1,
    height: 1,
    pixels: [
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
    ],
    actions: {
      jump: {
        limit: 15,
        speed: 1,
        y: 0,
        limitreched: false,
        done: true,
        step: 4,
      },
      damage: {},
    },
  };
  obstacle = {
    container: [],
    element: {
      x: 50,
      y: 45,
      width: this.canvas.width,
      height: 1,
      heightDevience: 4,
    },
  };
  game = {
    spec: null,
    speed: 7,
    initialspeed: 7,
    score: 0,
    highscore: 0,
    over: true,
  };
}
