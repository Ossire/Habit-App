import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HabitsModule } from './habits/habits.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3', // <-- The fix is right here
      database: 'habitup.sqlite',
      autoLoadEntities: true,
      synchronize: true,
    }),
    HabitsModule,
  ],
})
export class AppModule {}
