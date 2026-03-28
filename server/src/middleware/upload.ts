import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from './errorHandler';
import { isCloudStorageEnabled } from '../utils/storage';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const useCloud = isCloudStorageEnabled();

const photoStorage = useCloud
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, path.join(UPLOAD_DIR, 'photos/originals')),
      filename: (_req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`),
    });

const documentStorage = useCloud
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, path.join(UPLOAD_DIR, 'documents')),
      filename: (_req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`),
    });

const avatarStorage = useCloud
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, path.join(UPLOAD_DIR, 'avatars')),
      filename: (_req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`),
    });

const imageFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(400, 'PHOTO_INVALID_TYPE', '지원하지 않는 이미지 형식입니다.'));
  }
};

const documentFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(400, 'DOCUMENT_INVALID_TYPE', '지원하지 않는 파일 형식입니다.'));
  }
};

export const uploadPhoto = multer({
  storage: photoStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const uploadDocument = multer({
  storage: documentStorage,
  fileFilter: documentFilter,
  limits: { fileSize: 20 * 1024 * 1024 },
});

export const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
