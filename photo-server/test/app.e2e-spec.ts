import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});


//В приведённом коде происходит тестирование контроллера AppController с использованием библиотеки Supertest. 
// В начале теста создаётся тестовый модуль с импортом AppModule, затем создаётся приложение NestJS и его инициализация. После этого отправляется запрос GET по адресу / и проверяется, что ответ равен 200 и содержит «Hello World!»