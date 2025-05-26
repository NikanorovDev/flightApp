const axios = require('axios');
const fs = require('fs');
const crypto = require('crypto');
const FormData = require('form-data');
const path = require('path');

const PHOTOS_FOLDER = './photos'; // Папка с фотографиями
const SERVER_URL = 'http://localhost:3000/photos/upload'; // URL сервера
const TOTAL_PHOTOS_TO_SEND = 100; // Общее количество фотографий для отправки каждым дроном
const INTERVAL_MS = 50; // Интервал между отправками 
const SEND_RANDOM_ORDER = true; // true для случайного порядка, false для последовательного
const NUMBER_OF_DRONES = 10; // Количество дронов для имитации
const CORRUPT_PHOTO_PERCENTAGE = 10; // Процент фотографий с неправильной хеш-суммой (для тестирования)

let photoFiles = [];

function loadPhotoFiles() {
  photoFiles = fs.readdirSync(PHOTOS_FOLDER).filter((file) => {
    const ext = path.extname(file).toLowerCase();
    return ['.jpg', '.jpeg'].includes(ext);
  });

  if (photoFiles.length === 0) {
    throw new Error(`В папке ${PHOTOS_FOLDER} не найдено фотографий`);
  }
}

loadPhotoFiles();

function startDrone(droneId) {
  let photosSent = 0;

  function sendPhoto() {
    if (photosSent >= TOTAL_PHOTOS_TO_SEND) {
      console.log(
        `Дрон ${droneId}: отправлено ${TOTAL_PHOTOS_TO_SEND} фотографий. Остановка.`
      );
      clearInterval(intervalId);
      return;
    }

    try {
      let photoFile;
      if (SEND_RANDOM_ORDER) {
        const randomIndex = Math.floor(Math.random() * photoFiles.length);
        photoFile = photoFiles[randomIndex];
      } else {
        photoFile = photoFiles[photosSent % photoFiles.length];
      }

      const photoPath = path.join(PHOTOS_FOLDER, photoFile);
      const photoBuffer = fs.readFileSync(photoPath);


      const hashSum = crypto.createHash('sha256');
      hashSum.update(photoBuffer);
      const hexHash = hashSum.digest('hex');

      let finalHash = hexHash;
      const shouldCorrupt = Math.random() * 100 < CORRUPT_PHOTO_PERCENTAGE;
      if (shouldCorrupt) {
        finalHash = hexHash.split('').reverse().join('');
      }

      const form = new FormData();
      const dronePhotoFile = `drone${droneId}_${photoFile}`;
      form.append('photo', photoBuffer, dronePhotoFile);
      form.append('hash', finalHash);

      axios
        .post(SERVER_URL, form, {
          headers: form.getHeaders(),
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        })
        .then((response) => {
          console.log(
            `Дрон ${droneId} - Фото ${
              photosSent + 1
            } (${photoFile}) отправлено. Ответ сервера:`,
            response.data
          );
          photosSent++;
        })
        .catch((error) => {
          if (error.response) {
            console.error(
              `Дрон ${droneId} - Ошибка при отправке фото ${photosSent + 1}:`,
              error.response.data
            );
          } else {
            console.error(
              `Дрон ${droneId} - Ошибка при отправке фото ${photosSent + 1}:`,
              error.message
            );
          }
          photosSent++;
        });
    } catch (error) {
      console.error(`Дрон ${droneId} - Ошибка:`, error.message);
      photosSent++;
    }
  }

  const intervalId = setInterval(sendPhoto, INTERVAL_MS);
}

for (let i = 1; i <= NUMBER_OF_DRONES; i++) {
  startDrone(i);
}




// Данный код имитирует отправку фотографий несколькими БПЛА на сервер. Каждый БВС отправляет указанное количество фотографий с определенным интервалом, с возможностью отправки их в случайном порядке и добавления некоторых поврежденных фотографий для тестирования. Вот разбивка ключевых компонентов и функциональности:

// Ключевые компоненты
// Зависимости:

// axios: для отправки HTTP-запросов на сервер.
// fs: для операций с файловой системой (чтение файлов фотографий).
// crypto: для генерации хэш-значений фотографий.
// form-data: для построения запросов multipart/form-data для отправки файлов.
// path: для обработки путей к файлам независимым от платформы способом.
// Константы конфигурации:

// PHOTOS_FOLDER: каталог, в котором хранятся фотографии.
// SERVER_URL: URL-адрес конечной точки сервера, на которую будут отправлены фотографии.
// TOTAL_PHOTOS_TO_SEND: количество фотографий, которые отправит каждый БВС.
// INTERVAL_MS: временной интервал между отправкой каждой фотографии.
// SEND_RANDOM_ORDER: Булево значение для определения того, следует ли отправлять фотографии в случайном порядке.
// NUMBER_OF_DRONES: Общее количество БВС(дронов) для имитации.
// CORRUPT_PHOTO_PERCENTAGE: Процент фотографий, которые должны иметь неверные значения хэша для тестирования.
// Загрузка фотографий:

// Функция loadPhotoFiles считывает указанную папку и фильтрует файлы .jpg и .jpeg. Если фотографии не найдены, выдается ошибка.
// Имитация БВС (дрона):

// Функция startDrone инициализирует дрон(БВС), который будет отправлять фотографии с указанным интервалом, пока не достигнет общего количества фотографий для отправки.
// В sendPhoto каждая фотография считывается, хэшируется и потенциально повреждается на основе указанного процента.
// Создается объект FormData для отправки фотографии и ее хэша на сервер с помощью запроса POST.
// Ответ сервера регистрируется, и ошибки обрабатываются корректно.
// Выполнение:

// Цикл запускает каждый дрон(БВС), вызывая startDrone с уникальным идентификатором.

// Обработка ошибок: хотя текущая обработка ошибок надежна, но еще доподнительно  может потребоваться реализовать повторные попытки для временных ошибок (например, проблем с сетью).

// Этот код является прочной основой для моделирования поведения дронов(БПЛА) в сетевой среде и может быть расширен или изменен в зависимости от конкретных требований или сценариев тестирования.