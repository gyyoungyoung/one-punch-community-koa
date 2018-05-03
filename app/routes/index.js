const router = require('koa-router')();
const User = require('../models/user');
const Errors = require('../../errors');

router.get('/', async function (ctx, next) {
  ctx.state = {
    title: ''
  };

  await ctx.render('index', {
  });
});

router.post('login', async function (ctx, next) {
  try {
    if (!ctx.body.password) throw new Errors.ValidationError('password', 'password can not be empty')
    if (typeof ctx.body.password !== 'string') throw new Errors.ValidationError('password', 'password must be a string')
    if (ctx.body.password.length < 8) throw new Errors.ValidationError('password', 'password must longer than 8 characters')
    if (ctx.body.password.length > 32) throw new Errors.ValidationError('password', 'password can not be longer than 32 characters')

    const user = await
      User.login(ctx.body.name, ctx.body.password);

    ctx.body = {
      code: 0,
      data: {
        user: user,
        token: token,
      }
    }
  } catch (e) {
    next(e)
  }
});
module.exports = router;
