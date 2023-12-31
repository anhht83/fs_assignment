import moment from "moment-timezone";
import crypto from "crypto";
import jwt from "jwt-simple";
import { TokenType } from "../consts";
import { Attributes } from "sequelize";
import { User } from "../models/user";
import { Token } from "../models/token";

const {
  jwtSecret,
  jwtExpirationInterval,
  jwtRefreshExpirationInterval
} = require("../config/vars");

export default class TokenService {
  static async generateToken(user: Attributes<User>) {
    const userId = (user.id || user) as number;
    // generate refresh token and store in db
    const refreshToken = `${userId}.${crypto.randomBytes(40).toString("hex")}`;
    await Token.create({
      userId,
      token: refreshToken,
      expires: moment().add(jwtRefreshExpirationInterval, "minutes").toDate(),
      type: TokenType.REFRESH
    });

    // generate access token
    const payload = {
      exp: moment().add(jwtExpirationInterval, "minutes").unix(),
      iat: moment().unix(),
      sub: userId,
      type: TokenType.ACCESS
    };
    const accessToken = jwt.encode(payload, jwtSecret);


    return {
      tokenType: TokenType.AUTH,
      accessToken,
      refreshToken,
      expiresIn: moment().add(jwtExpirationInterval, "minutes")
    };
  }
}
