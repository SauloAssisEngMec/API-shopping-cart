import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

console.log(process.env.DATABASE_URL);
@Module({
  imports: [MongooseModule.forRoot(process.env.DATABASE_URL)],
  exports: [MongooseModule],
})
export class DatabaseModule {}
