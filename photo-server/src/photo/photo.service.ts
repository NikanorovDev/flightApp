import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import * as mime from 'mime-types';
import { PhotoResponse } from 'src/photo/interfaces/photo-response.interface';

@Injectable()
export class PhotoService {
  private logger = new Logger(PhotoService.name);

  constructor(private config: ConfigService) {}

  async save(
    file: Express.Multer.File,
    clientHash: string,
  ): Promise<PhotoResponse> {
    const mimeType = mime.lookup(file.originalname) || file.mimetype;

    if (!['image/jpeg'].includes(mimeType)) {
      this.logger.warn(`Недопустимый тип файла: ${mimeType}`);
      throw new BadRequestException('Недопустимый тип файла');
    }

    const hashSum = crypto.createHash('sha256');
    hashSum.update(file.buffer);
    const serverHash = hashSum.digest('hex');

    if (clientHash !== serverHash) {
      this.logger.warn('Хеш-суммы не совпадают. Данные могут быть повреждены.');
      throw new BadRequestException(
        'Данные повреждены: хеш-суммы не совпадают',
      );
    }

    const savePath = this.config.get<string>('PHOTO_SAVE_PATH');

    const date = new Date();
    const year = date.getFullYear();
    const month = `0${date.getMonth() + 1}`.slice(-2);
    const day = `0${date.getDate()}`.slice(-2);

    const dirPath = path.join(savePath, `${year}-${month}-${day}`);

    if (!fs.existsSync(dirPath)) {
      await fs.promises.mkdir(dirPath, { recursive: true });
    }

    const uniqueFilename = `${uuidv4()}-${file.originalname}`;
    const filePath = path.join(dirPath, uniqueFilename);

    const startTime = Date.now();
    await fs.promises.writeFile(filePath, file.buffer);
    const endTime = Date.now();
    const saveTime = endTime - startTime;

    if (saveTime > 50) {
      this.logger.warn(
        `Время сохранения файла (${saveTime} мс) превышает допустимое.`,
      );
    }

    this.logger.log(
      `Фото сохранено: ${filePath}, время сохранения: ${saveTime} мс`,
    );

    return {
      message: 'Фото успешно сохранено',
      filename: uniqueFilename,
    };
  }
}




// Этот код определяет класс PhotoService в приложении NestJS, который отвечает за обработку логики, связанной с сохранением загруженных фотографий. Вот подробное описание его компонентов и функциональности:

// Ключевые компоненты
// Импорты:

// Импортируются различные модули и библиотеки, в том числе:
//  для доступа к параметрам конфигурации.
// Встроенные модули Node.js, такие как fs (файловая система) и path для обработки файловых операций и путей.
// crypto для генерации хэш-значений.
// uuid для создания уникальных идентификаторов для имен файлов.
// mime-types для определения типа MIME файлов.
// Интерфейс PhotoResponse для определения структуры ответа после сохранения фотографии.


// Класс PhotoService декорирован @Injectable(), что делает его доступным для внедрения зависимостей.
// Logger:

// Экземпляр logger создается для регистрации сообщений, связанных с операциями с фотографиями, что может помочь в отладке и мониторинге.
// Конструктор:

// Конструктор принимает экземпляр ConfigService, который используется для извлечения значений конфигурации (например, пути, по которому будут сохранены фотографии).
// Метод save
// Метод save является основной функцией PhotoService, отвечающей за сохранение загруженной фотографии. Вот как это работает:

// Проверка MIME-типа:

// Он проверяет тип MIME загруженного файла. Разрешены только изображения JPEG (image/jpeg). Если тип MIME недействителен, регистрируется предупреждение и выдается исключение BadRequestException.
// Проверка хэша:

// Метод вычисляет хэш SHA-256 буфера загруженного файла и сравнивает его с clientHash, предоставленным в запросе. Если хэши не совпадают, регистрируется предупреждение и выдается исключение BadRequestException, указывающее на то, что данные могут быть повреждены.
// Подготовка каталога:

// Метод извлекает путь сохранения фотографии из конфигурации и создает путь к каталогу на основе текущей даты (формат год-месяц-день).
// Если каталог не существует, он создает его рекурсивно.
// Создание уникального имени файла:

// Уникальное имя файла генерируется с помощью uuidv4() в сочетании с исходным именем файла, чтобы избежать конфликтов.
// Сохранение файла:

// Метод измеряет время, необходимое для сохранения файла. Он записывает буфер файла по указанному пути и регистрирует затраченное время. Если сохранение занимает больше 50 миллисекунд, регистрируется предупреждение.
// Регистрация:

// Успешные операции сохранения регистрируются, предоставляя информацию о пути к сохраненному файлу и времени, затраченном на операцию.
// Возвращаемый ответ:

// Наконец, метод возвращает объект PhotoResponse с сообщением об успешном завершении и уникальным именем файла сохраненной фотографии.
// Резюме
// В целом, класс PhotoService инкапсулирует логику для проверки и сохранения загруженных фотографий JPEG, обеспечивая целостность данных с помощью проверки хэша и управляя хранилищем файлов с соответствующим журналированием(логом) для мониторинга. Этот модульный подход соответствует принципам фреймворка NestJS, продвигая чистую архитектуру и разделение задач.