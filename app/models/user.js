const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const crypto = require('crypto');
const bluebird = require('bluebird');
const pbkdf2Async = bluebird.promisify(crypto.pbkdf2);
const SALT = require('../../cipher').PASSWORD_SALT;
const logger = require('../logger');
const Errors = require('../../errors');

const UserSchema = new Schema({
  name: {type: String, require: true},
  password: String
});

const UserModel = mongoose.model('user', UserSchema);

UserSchema.index({name: 1}, {unique: true})

const DEFAULT_PROJECTION = {name: 0, password: 0, __v: 0}

/**
 * 注册
 * @param params
 * @returns {Promise<void>}
 */
async function createANewUser(params) {
  const user = new UserModel({name: params.name});

  if (params.password) {
    user.password = await pbkdf2Async(params.password, SALT, 512, 128, 'sha1')
      .then(r => r.toString())
      .catch(e => {
        console.log(e);
        throw new Error('密码加密失败');
      });
  }

  let created = await user.save()
    .catch(e => {
      logger.error('注册用户失败', e);
      switch (e.code) {
        case 11000:
          throw new Errors.DuplicatedUserNameError(params.name);
          break;
        default:
          throw new Errors.ValidationError('user', `error creating user ${ JSON.stringify(params) }`)
      }
    });
  return {
    _id: created._id,
    name: created.name
  };
}

/**
 * 登录
 * @param phoneNumber
 * @param password
 * @returns {Promise<void>}
 */
async function login(phoneNumber, password) {
  password = await pbkdf2Async(password, SALT, 512, 128, 'sha1')
    .then(r => r.toString())
    .catch(e => {
      console.log(e)
      throw new Errors.InternalError('服务器内部错误');
    });
  const user = await  UserModel.findOne({phoneNumber: phoneNumber, password: password})
    .select(DEFAULT_PROJECTION)
    .catch(e => {
      logger.error(e)
      throw new Error('something wrong with the server');
    })
  if (!user) throw Error('没有该用户');
  return user;
}
