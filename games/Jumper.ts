import { events } from '../utility/utility';

export function Jumper(canvas) {
  new logics(gameobjects(canvas));
}

class logics {
  interval = null;

  constructor(private gobject) {
    events.any(() =>
      this.events.input.inputAction(
        gobject,
        this.actions,
        this.events.lifecycle
      )
    );

    const animations = animationgenerator(gobject);
    events.lifecycle.render(() =>
      this.events.lifecycle.onrender(gobject, animations)
    );
  }

  actions = {
    jump: () => {
      const { player, canvas, game } = this.gobject;
      player.actions.jump.done = false;
      player.actions.jump.y = -canvas.height;
      game.score += 1;
      this.actions.updatespec(false);
    },

    jumpstate: () => {
      const { player } = this.gobject;
      if (!player.actions.jump.done) {
        player.y += player.actions.jump.y / 35;
        player.actions.jump.y++;
      }
      if (player.y <= player.actions.jump.range.top) {
        player.actions.jump.y = 1;
        player.y = player.actions.jump.range.top;
      }

      if (player.y > player.actions.jump.range.bottom - player.height) {
        player.y = player.actions.jump.range.bottom - player.height - 1;
        this.actions.updatespec(true);
      }
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

  events = {
    input: {
      inputAction: function (gobject, actions, lifecycle) {
        const { game, player } = gobject;
        if (!game.over) {
          actions.jump();
          return;
        }
        console.log(1);
        game.over = false;
        game.score = 0;
        game.speed = game.initialspeed;
        player.x = player.initialpos.x;
        player.y = player.initialpos.y;
        player.actions.jump.y = 0;
        player.actions.jump.done = false;
        lifecycle.update(gobject, actions, lifecycle.onupdate);
        actions.jump();
      },
    },

    lifecycle: {
      update: function (gobject, actions, onupdate) {
        events.lifecycle.update(
          () => onupdate(gobject, actions),
          (1 + Math.pow(2, -gobject.game.score / 100)) * gobject.game.speed
        );
      },

      count: 0,
      onupdate: function ({ game }, actions) {
        if (game.over) return;
        if (game.update.count < 10) {
          game.update.count++;
        }

        actions.jumpstate();
      },

      onrender: ({ canvas, obstacle, game, player }, animations) => {
        //if (game.over) return;
        canvas.context.clearRect(0, 0, canvas.width, canvas.height);
        animations.forEach((e) => e());

        canvas.context.fillRect(0, 0, 50, player.actions.jump.range.top);
        canvas.context.fillRect(
          0,
          player.actions.jump.range.bottom,
          50,
          player.actions.jump.range.bottom
        );

        obstacle.container.forEach((e) => {
          canvas.context.fillRect(e.x, 0, e.width, e.y);
          canvas.context.fillRect(
            e.x,
            e.y + e.height,
            e.width,
            canvas.height - e.y - e.height
          );
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
      initialpos: { x: (canvas.width - 6) / 2, y: canvas.height - 10 - 6 },
      x: 0,
      y: 0,
      width: 6,
      height: 5,
      actions: {
        jump: {
          limit: 15,
          speed: 1,
          y: 0,
          limitreched: false,
          done: true,
          range: {
            top: 4,
            bottom: canvas.height - 4,
          },
        },
        damage: {},
      },
    },
    obstacle: {
      container: [{ x: 50, y: 45, width: 10, height: canvas.height }],
      element: {
        x: 50,
        y: 45,
        width: 5,
        height: 5,
      },
      interval: 4 / 5,
    },
    game: {
      spec: null,
      speed: 5,
      initialspeed: 8,
      score: 0,
      highscore: 0,
      over: true,
      update: { count: 0 },
    },
  };
}

function animationgenerator({ canvas, player, firstframe }) {
  return [() => canvas.context.fillRect(player.x, player.y, 5, 5)];
  return [
    () => {
      const pixels = [
        [0, 0, 0, 0, 0, 0],
        [0, 1, 1, 1, 1, 0],
        [1, 1, 1, 0, 1, 1],
        [1, 1, 1, 1, 1, 0],
        [0, 1, 1, 1, 1, 0],
      ];
      const height = pixels.length;
      if (firstframe > 10) {
        firstframe = 0;
      }
      firstframe++;

      if (firstframe < 5) {
        pixels[0] = [1, 1, 0, 0, 0, 0];
      } else {
        pixels[0] = [0, 0, 0, 0, 0, 0];
      }

      pixels.forEach((rows, i) => {
        rows.forEach((pixel, j) => {
          pixel && canvas.context.fillRect(player.x + j, player.y + i, 1, 1);
        });
      });
    },
  ];
}
