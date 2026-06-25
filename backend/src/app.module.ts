import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HabitsModule } from './habits/habits.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './users/entities/user.entity';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // TypeOrmModule.forRoot({
    //   type: 'better-sqlite3', // <-- The fix is right here
    //   database: 'habitup.sqlite',
    //   autoLoadEntities: true,
    //   synchronize: true,
    // }),
    // Load .env first so every other module can access config
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_NAME', 'habitup'),
        entities: [User],
        // Set to false and use migrations in production
        // synchronize: configService.get<string>('NODE_ENV') !== 'production',
        synchronize: true, // for now
      }),
    }),
    AuthModule,
    UsersModule,
    HabitsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
