import { ConfigService } from '@nestjs/config';
import { PhotoResponse } from 'src/photo/interfaces/photo-response.interface';
export declare class PhotoService {
    private config;
    private logger;
    constructor(config: ConfigService);
    save(file: Express.Multer.File, clientHash: string): Promise<PhotoResponse>;
}
