import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './common/datasource';
import { UserModule } from './module/user/user.module';
import { AuthModule } from './module/auth/auth.module';
import { APP_FILTER, RouterModule } from '@nestjs/core';
import { DuplicateEntryException } from './common/http-filters';
import { EventEmitterModule } from '@nestjs/event-emitter';

export const API_PREFIX = 'api/v1';

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    RouterModule.register([
      {
      path: API_PREFIX,
      children: [
        {
          path: 'users',
          module: UserModule,
        },
        {
          path: 'auth',
          module: AuthModule,
        },
      ],
    },
  ]),
  AuthModule,
  UserModule,
  EventEmitterModule.forRoot(),


  ],
  
  providers: [
    { provide: APP_FILTER,
      useClass: DuplicateEntryException  // pour gerer les doublons dans la bdd
    },
  ],
})
export class AppModule {}
