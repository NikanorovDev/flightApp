"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PhotoService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhotoService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const uuid_1 = require("uuid");
const mime = require("mime-types");
let PhotoService = PhotoService_1 = class PhotoService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(PhotoService_1.name);
    }
    async save(file, clientHash) {
        const mimeType = mime.lookup(file.originalname) || file.mimetype;
        if (!['image/jpeg'].includes(mimeType)) {
            this.logger.warn(`Недопустимый тип файла: ${mimeType}`);
            throw new common_1.BadRequestException('Недопустимый тип файла');
        }
        const hashSum = crypto.createHash('sha256');
        hashSum.update(file.buffer);
        const serverHash = hashSum.digest('hex');
        if (clientHash !== serverHash) {
            this.logger.warn('Хеш-суммы не совпадают. Данные могут быть повреждены.');
            throw new common_1.BadRequestException('Данные повреждены: хеш-суммы не совпадают');
        }
        const savePath = this.config.get('PHOTO_SAVE_PATH');
        const date = new Date();
        const year = date.getFullYear();
        const month = `0${date.getMonth() + 1}`.slice(-2);
        const day = `0${date.getDate()}`.slice(-2);
        const dirPath = path.join(savePath, `${year}-${month}-${day}`);
        if (!fs.existsSync(dirPath)) {
            await fs.promises.mkdir(dirPath, { recursive: true });
        }
        const uniqueFilename = `${(0, uuid_1.v4)()}-${file.originalname}`;
        const filePath = path.join(dirPath, uniqueFilename);
        const startTime = Date.now();
        await fs.promises.writeFile(filePath, file.buffer);
        const endTime = Date.now();
        const saveTime = endTime - startTime;
        if (saveTime > 50) {
            this.logger.warn(`Время сохранения файла (${saveTime} мс) превышает допустимое.`);
        }
        this.logger.log(`Фото сохранено: ${filePath}, время сохранения: ${saveTime} мс`);
        return {
            message: 'Фото успешно сохранено',
            filename: uniqueFilename,
        };
    }
};
exports.PhotoService = PhotoService;
exports.PhotoService = PhotoService = PhotoService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PhotoService);
//# sourceMappingURL=photo.service.js.map