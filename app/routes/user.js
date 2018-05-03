const router = require('koa-router')();
const User = require('../models/user');

router.post('/', async function (ctx, next) {
  try {
    let user = await User.createANewUser({
      name: ctx.body.name,
      password: ctx.body.password,
    });
    return {
      code: 0,
      user: user,
    };
  } catch(e) {
    next(e)
  }
  ctx.body = 'this a users response!';
});

module.exports = router;
