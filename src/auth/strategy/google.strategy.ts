import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import axios from 'axios';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService) {
    super({
      clientID: config.get('googleAuth.clientId'),
      clientSecret: config.get('googleAuth.clientSecret'),
      callbackURL: config.get('googleAuth.callback'),
      scope: ['profile', 'email'],
      passReqToCallback: true,
    });
  }

  async clientValidate(accessToken: string): Promise<any> {
    try {
      const { data } = await axios.get(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const { email, given_name, family_name } = data;

      const user = {
        email,
        firstName: given_name,
        lastName: family_name,
      };

      return user;
    } catch (error) {
      throw new BadRequestException('Google Authentication Failed');
    }
  }

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    const user = {
      email: profile.emails[0].value,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
    };

    return done(null, user);
  }
}
