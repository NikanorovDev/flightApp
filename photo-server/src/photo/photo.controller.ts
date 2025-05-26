import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { PhotoService } from './photo.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { PhotoResponse } from 'src/photo/interfaces/photo-response.interface';

@Controller('photos')
export class PhotoController {
  constructor(private readonly photoService: PhotoService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('photo'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('hash') clientHash: string,
  ): Promise<PhotoResponse> {
    if (!clientHash) {
      throw new BadRequestException('Хеш-сумма не предоставлена');
    }

    return this.photoService.save(file, clientHash);
  }
}



// Этот код представляет собой реализацию TypeScript контроллера в приложении NestJS, который обрабатывает загрузку фотографий. Вот разбивка его компонентов:

// Импорты: импортируются необходимые декораторы и классы из NestJS. также импортируется  (PhotoService), которая будет обрабатывать бизнес-логику для сохранения фотографии.

// Определение контроллера: класс PhotoController,  будет обрабатывать запросы, отправленные в конечную точку /photos.

// Конструктор: конструктор внедряет экземпляр PhotoService, который используется для выполнения операций, связанных с фотографиями.

// Конечная точка загрузки: метод загрузки декорирован @Post('upload'), что указывает на то, что он будет обрабатывать запросы POST в конечную точку /photos/upload. Он использует FileInterceptor для обработки загрузок файлов, в частности, для поиска поля файла с именем photo.

// Параметры метода: Метод принимает два параметра:

// @UploadedFile() file: извлекает загруженный файл.
// @Body('hash') clientHash: извлекает значение хеша из тела запроса.
// Проверка: Метод проверяет, предоставлен ли clientHash. Если нет, он выдает исключение BadRequestException с сообщением о том, что хеш не был предоставлен.

// Вызов службы: если хеш действителен, он вызывает метод сохранения PhotoService, передавая загруженный файл и хеш клиента, и возвращает PhotoResponse.

// В целом, этот контроллер отвечает за обработку загрузки файлов, проверку ввода и делегирование фактической логики сохранения файла PhotoService.
