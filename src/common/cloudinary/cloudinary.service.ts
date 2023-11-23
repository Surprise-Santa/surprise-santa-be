import { BadRequestException, Injectable } from '@nestjs/common';
import { CloudinaryResponse } from './cloudinary.response';
import {
  UploadApiErrorResponse,
  UploadApiResponse,
  v2 as cloudinary,
} from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { UPLOAD_FILE_NAME } from './constants';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {}

  folder = this.configService.get('cloudinary.folderName');

  uploadFile(file: Express.Multer.File): Promise<CloudinaryResponse> {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: this.folder, resource_type: 'auto' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          },
        )
        .end(file.buffer);
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    type: string,
    id: string,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    try {
      return new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: 'image',
              // create folder to store image
              public_id: `${this.folder}/${type}/${id}`,
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            },
          )
          .end(file.buffer);
      });
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error.message);
    }
  }

  async uploadLogo(
    file: Express.Multer.File,
    id: string,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return this.uploadImage(file, UPLOAD_FILE_NAME.LOGO, id);
  }

  async uploadProfilePic(
    file: Express.Multer.File,
    id: string,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return this.uploadImage(file, UPLOAD_FILE_NAME.PROFILE_PIC, id);
  }
}
