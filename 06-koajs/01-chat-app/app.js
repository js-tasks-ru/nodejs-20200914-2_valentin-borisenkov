const path = require('path');
const Koa = require('koa');
const app = new Koa();

app.use(require('koa-static')(path.join(__dirname, 'public')));
app.use(require('koa-bodyparser')());

const Router = require('koa-router');

const router = new Router();

let clients = [];

const sendMessageToClient = (ctx, done, next) => (message) => {
  ctx.body = message;
  done();
};

router.get('/subscribe', async (ctx, next) => {
  return new Promise((resolve) => {
    clients.push(sendMessageToClient(ctx, resolve));
  });
});

router.post('/publish', async (ctx, next) => {
  const {message} = ctx.request.body;

  if (message) {
    clients.forEach((client) => client(message));
    clients = [];
  }

  ctx.body = 'created';
  ctx.status = 201;

  return next();
});

app.use(router.routes());

module.exports = app;
