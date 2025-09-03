import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { EmailService } from './email.service';
import { Email } from '../database/schemas/email.schema';

@Controller('emails')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get()
  async getAllEmails(): Promise<Email[]> {
    return this.emailService.getAllEmails();
  }

  @Get('status')
  async getSystemStatus() {
    return this.emailService.getSystemStatus();
  }

  @Get(':id')
  async getEmailById(@Param('id') id: string): Promise<Email> {
    return this.emailService.getEmailById(id);
  }

  @Get('message/:messageId')
  async getEmailByMessageId(@Param('messageId') messageId: string): Promise<Email> {
    return this.emailService.getEmailByMessageId(messageId);
  }

  @Post('process')
  async processEmails() {
    try {
      await this.emailService.checkForNewEmails();
      return { message: 'Email processing triggered successfully' };
    } catch (error) {
      return { 
        message: 'Error processing emails', 
        error: error.message 
      };
    }
  }
}
