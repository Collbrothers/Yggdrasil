import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
process.env.TEST = 'true';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  }, 60000);

  const login = {
    username: 'test',
    password: 'test',
  };

  let headers = {
    Authentication: '',
    'Authentication-Refresh': '',
  };

  it('/auth/create (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/create')
      .send(login)
      .expect(201);
  });

  it('/auth/login (POST, Admin)', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send(login)
      .ok((res) => {
        expect(res.body).toHaveProperty('accessToken');
        expect(res.body).toHaveProperty('refreshToken');
        headers = {
          Authentication: res.body.accessToken,
          'Authentication-Refresh': res.body.refreshToken,
        };
        return true;
      });
  });

  it('/auth/refresh_token (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/refresh_token')
      .set(headers)
      .ok((res) => {
        expect(res.body).toHaveProperty('accessToken');
        expect(res.body).toHaveProperty('refreshToken');
        headers = {
          Authentication: res.body.accessToken,
          'Authentication-Refresh': res.body.refreshToken,
        };
        return true;
      });
  });

  it('/auth/logout (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/logout')
      .set(headers)
      .expect(200);
  });

  afterAll(async () => await app.close());
});
