import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { EmailModule } from './email/email.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    // Configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // Database connection
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/email-analyzer'),
    
    // Scheduling for email monitoring
    ScheduleModule.forRoot(),
    
    // Application modules
    DatabaseModule,
    EmailModule,
  ],
})
export class AppModule {}
