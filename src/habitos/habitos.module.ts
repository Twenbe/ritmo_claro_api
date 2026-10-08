import { Module } from '@nestjs/common';
import { HabitosController } from './habitos.controller';
import { HabitosService } from './habitos.service';

@Module({
  controllers: [HabitosController],
  providers: [HabitosService],
})
export class HabitosModule {}
