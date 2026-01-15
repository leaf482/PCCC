import { Module } from '@nestjs/common';
import { CustomsController } from './customs.controller';
import { 개인고유통관부호Service } from './개인고유통관부호.service';

@Module({
  controllers: [CustomsController],
  providers: [개인고유통관부호Service],
})
export class AppModule {}