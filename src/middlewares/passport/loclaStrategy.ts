import { getLoginInfo, verifyPassword } from '../../services/auth.service.js';
import * as passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

export const localStrategy = () => {
    passport.use("local", new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password'
        },
        async (username, password, done) => {
            try {
                const LoginInfo = await getLoginInfo(username);
                if (!LoginInfo) {
                    return done(null, false, { message: '아이디를 찾을 수 없습니다' });
                }
                if (!await verifyPassword(password, LoginInfo.password_hash)) {
                    return done(null, false, { message: '비밀번호가 일치하지 않습니다' });
                }
                return done(null, LoginInfo);
            } catch (error) {
                return done(error);
            }
        }
    ))
};
