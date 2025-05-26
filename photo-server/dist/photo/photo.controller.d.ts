import { PhotoService } from './photo.service';
import { PhotoResponse } from 'src/photo/interfaces/photo-response.interface';
export declare class PhotoController {
    private readonly photoService;
    constructor(photoService: PhotoService);
    upload(file: Express.Multer.File, clientHash: string): Promise<PhotoResponse>;
}
