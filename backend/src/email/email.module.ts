import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Email, EmailSchema } from '../database/schemas/email.schema';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { EmailAnalysisService } from './email-analysis.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Email.name, schema: EmailSchema }
    ]),
  ],
  controllers: [EmailController],
  providers: [EmailService, EmailAnalysisService],
  exports: [EmailService, EmailAnalysisService],
})
export class EmailModule {}
