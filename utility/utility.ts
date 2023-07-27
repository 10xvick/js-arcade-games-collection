export const events = {
  any: (fn) => {
    let keypressed = false;
    ['keydown', 'touchstart'].forEach((eventType) =>
      document.addEventListener(eventType, (e) => {
        if (!keypressed) {
          fn();
          keypressed = true;
        }
      })
    );
    ['keyup', 'touchend'].forEach((eventType) =>
      document.addEventListener(eventType, (e) => {
        keypressed = false;
      })
    );
  },

  lifecycle: {
    interval: null,
    update: function (fn, timestamp) {
      this.interval && clearInterval(this.interval);
      this.interval = setInterval(fn, timestamp);
    },

    render: function (fn) {
      fn();
      requestAnimationFrame(() => this.render(fn));
    },
  },
};

export const helper = {
  randomrange: function (max, min) {
    return Math.floor(Math.random() * (max - min) + min);
  },
};
