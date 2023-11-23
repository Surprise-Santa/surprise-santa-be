import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { CLOUDINARY } from './constants';

export const CloudinaryProvider = {
  provide: CLOUDINARY,
  useFactory: (config: ConfigService) =>
    cloudinary.config({
      cloud_name: config.get('cloudinary.cloudName'),
      api_key: config.get('cloudinary.apiKey'),
      api_secret: config.get('cloudinary.apiSecret'),
    }),
  inject: [ConfigService],
};
