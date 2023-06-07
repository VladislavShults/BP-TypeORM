import { Request } from 'express';
import { FileFilterCallback } from 'multer';
import { HttpException, HttpStatus } from '@nestjs/common';

export const imageFormatFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: FileFilterCallback,
) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    throw new HttpException(
      'Invalid file type. Only JPEG, PNG, and GIF are allowed.',
      HttpStatus.BAD_REQUEST,
    );
  }
};
