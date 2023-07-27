import { events, helper } from '../utility/utility';

export function Doodlejump(canvas) {
  new logics(gameobjects(canvas));
}

class logics {
  interval = null;

  constructor(private gobject) {
    events.any(() => this.events.input.inputAction(gobject, this.actions));

    const animations = animationgenerator(gobject);
    events.lifecycle.render(() =>
      this.events.lifecycle.onrender(gobject, animations)
    );
  }

  actions = {
    jump: () => {
      const { jump } = this.gobject.player.actions;
      if (!jump.done) return;
      jump.done = false;
      jump.y = -50;
    },

    jumpstate: () => {
      const { player, obstacle, canvas } = this.gobject;
      if (!player.actions.jump.done) {
        player.ylast = player.y;
        player.y += player.actions.jump.y / 100;
        player.actions.jump.y++;

        if (player.y > player.ylast) {
          for (let i = obstacle.container.length - 1; i > -1; i--) {
            const o = obstacle.container[i];
            if (
              o.y > player.y &&
              o.y < player.y + player.height &&
              player.x > o.x - player.width &&
              player.x < o.x + o.width
            ) {
              player.base = o;
              player.actions.jump.y = 0;
              player.actions.jump.done = true;
              player.distance = player.x - player.base.x;
              break;
            }
          }
        }
      } else {
        player.y = player.base.y - player.height;
      }
    },

    movement: () => {
      const { obstacle, canvas, player } = this.gobject;
      obstacle.container.forEach((o) => {
        if (o.y > canvas.height) {
          this.actions.destroyandcreatenew();
        } else o.y += 0.05;

        let moveby = 0;
        if (o.dir) {
          if (o.x <= 0) {
            o.dir = !o.dir;
          } else moveby = -o.speed / 10;
        } else {
          if (o.x >= canvas.width - o.width) {
            o.dir = !o.dir;
          } else moveby = o.speed / 10;
        }
        o.x += moveby;
        if (o == player.base && player.actions.jump.done) player.x += moveby;
      });

      if (player.y + player.height > canvas.height) {
        player.y = 0;
        this.actions.updatespec(true);
      }
    },

    destroyandcreatenew: (n = 1) => {
      const { obstacle, game } = this.gobject;
      obstacle.container.shift();

      for (let i = 0; i < n; i++)
        obstacle.container.push(this.generator.floor(this.gobject));
      game.score += 1;
      this.actions.updatespec(false);
      this.events.lifecycle.update(this.gobject, this.actions);
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

  generator = {
    floor: function ({ obstacle, canvas }) {
      const passway_w = (canvas.width * helper.randomrange(4, 2)) / 8;
      const distance =
        (obstacle.container.at(-1)?.y || canvas.height) -
        canvas.height / obstacle.total;
      console.log(
        Array(100)
          .fill(0)
          .map((e) => helper.randomrange(3, 0))
      );
      return {
        x: (canvas.width - passway_w) / 2,
        y: distance,
        width: passway_w,
        height: 2,
        dir: helper.randomrange(3, 0),
        speed: helper.randomrange(3, 0),
      };
    },
  };

  events = {
    input: {
      inputAction: function ({ game, player, obstacle }, actions) {
        if (!game.over) actions.jump();
        else {
          game.over = false;
          game.score = 0;
          game.speed = game.initialspeed;
          obstacle.container = [];
          actions.destroyandcreatenew(obstacle.total);
          player.base = obstacle.container[0];
          player.x = player.initialpos.x;
          player.y = player.initialpos.y;
          player.actions.jump.y = 0;
          player.actions.jump.done = false;
          actions.updatespec(false);
        }
      },
    },

    lifecycle: {
      update: function (gobject, actions) {
        events.lifecycle.update(
          () => this.onupdate(gobject, actions),
          (1 + Math.pow(2, -gobject.game.score / 100)) * gobject.game.speed
        );
      },

      count: 0,
      onupdate: function ({ game }, actions) {
        if (game.over) return;
        if (this.count < 10) {
          this.count++;
        }

        actions.jumpstate();
        actions.movement();
      },

      onrender: ({ canvas, obstacle, game, player }, animations) => {
        if (game.over) return;
        canvas.context.clearRect(0, 0, canvas.width, canvas.height);
        animations.forEach((e) => e());

        canvas.context.fillRect(0, player.base.y, 1, 5);

        obstacle.container.forEach((e) => {
          canvas.context.fillRect(...Object.values(e));
        });
      },
    },
  };
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
      initialpos: { x: canvas.width / 2, y: (canvas.height - 5) / 2 },
      distance: 0,
      x: 0,
      y: 0,
      width: 5,
      height: 5,
      base: { y: 0, x: 0 },
      baseIndex: 0,
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
      container: [{ x: 50, y: 45, width: 10, height: 10 }],
      element: {
        x: 50,
        y: 45,
        width: 5,
        height: 5,
      },
      total: 4,
    },
    game: {
      spec: null,
      speed: 3,
      initialspeed: 3,
      score: 0,
      highscore: 0,
      over: true,
    },
  };
}

function animationgenerator({ canvas, player, firstframe }) {
  const pixels = [
    [0, 1, 1, 1, 0],
    [1, 1, 1, 1, 1],
    [1, 0, 1, 0, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
  ];
  return [
    () => {
      pixels.forEach((rows, i) => {
        rows.forEach((pixel, j) => {
          pixel && canvas.context.fillRect(player.x + j, player.y + i, 1, 1);
        });
      });
    },
  ];
}
