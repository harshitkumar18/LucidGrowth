import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as Imap from 'imap';
import { Email, EmailDocument } from '../database/schemas/email.schema';
import { EmailAnalysisService } from './email-analysis.service';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private imap: Imap;

  constructor(
    @InjectModel(Email.name) private emailModel: Model<EmailDocument>,
    private emailAnalysisService: EmailAnalysisService,
  ) {
    this.initializeImap();
  }

  private initializeImap() {
    this.imap = new Imap({
      user: process.env.IMAP_USER,
      password: process.env.IMAP_PASS,
      host: process.env.IMAP_HOST,
      port: parseInt(process.env.IMAP_PORT) || 993,
      tls: process.env.IMAP_TLS === 'true',
      tlsOptions: { rejectUnauthorized: false },
    });

    this.imap.once('ready', () => {
      this.logger.log('IMAP connection established');
    });

    this.imap.once('error', (err) => {
      this.logger.error('IMAP connection error:', err);
    });

    this.imap.once('end', () => {
      this.logger.log('IMAP connection ended');
    });
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async checkForNewEmails() {
    if (!this.imap.state || this.imap.state !== 'authenticated') {
      try {
        await this.connectImap();
      } catch (error) {
        this.logger.error('Failed to connect to IMAP:', error);
        return;
      }
    }

    try {
      await this.processNewEmails();
    } catch (error) {
      this.logger.error('Error processing emails:', error);
    }
  }

  private async connectImap(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.imap.connect();
      this.imap.once('ready', () => resolve());
      this.imap.once('error', reject);
    });
  }

  private async processNewEmails(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.imap.openBox('INBOX', false, (err, box) => {
        if (err) {
          reject(err);
          return;
        }

        // Search for emails with the test subject
        const testSubject = process.env.TEST_EMAIL_SUBJECT || 'Email Analysis Test';
        this.imap.search(['UNSEEN', ['SUBJECT', testSubject]], (err, results) => {
          if (err) {
            reject(err);
            return;
          }

          if (results.length === 0) {
            resolve();
            return;
          }

          this.logger.log(`Found ${results.length} new test emails`);

          const fetch = this.imap.fetch(results, { bodies: '', struct: true });
          
          fetch.on('message', (msg) => {
            let buffer = '';
            
            msg.on('body', (stream) => {
              stream.on('data', (chunk) => {
                buffer += chunk.toString('utf8');
              });
              
              stream.once('end', () => {
                this.processEmailBuffer(buffer, msg);
              });
            });
          });

          fetch.once('error', reject);
          fetch.once('end', () => {
            this.logger.log('Finished processing emails');
            resolve();
          });
        });
      });
    });
  }

  private async processEmailBuffer(buffer: string, msg: any) {
    try {
      // Parse email headers
      const emailData = this.parseEmailHeaders(buffer);
      
      if (!emailData) {
        this.logger.warn('Failed to parse email headers');
        return;
      }

      // Check if email already exists
      const existingEmail = await this.emailModel.findOne({ 
        messageId: emailData.messageId 
      });

      if (existingEmail) {
        this.logger.log(`Email ${emailData.messageId} already processed`);
        return;
      }

      // Analyze email for receiving chain and ESP
      const analysis = await this.emailAnalysisService.analyzeEmail(emailData);

      // Save to database
      const email = new this.emailModel({
        messageId: emailData.messageId,
        subject: emailData.subject,
        from: emailData.from,
        to: emailData.to,
        date: emailData.date,
        headers: emailData.headers,
        receivingChain: analysis.receivingChain,
        espType: analysis.espType,
        espDetails: analysis.espDetails,
        status: 'processed',
        rawEmail: emailData,
      });

      await email.save();
      this.logger.log(`Successfully processed email: ${emailData.messageId}`);

    } catch (error) {
      this.logger.error('Error processing email buffer:', error);
    }
  }

  private parseEmailHeaders(buffer: string): any {
    try {
      const lines = buffer.split(/\r?\n/);
      const headers: Record<string, any> = {};
      let bodyStart = false;
      let body = '';
      let currentKey: string | null = null;

      const commitHeader = (key: string, value: string) => {
        const lowerKey = key.toLowerCase();
        if (headers[lowerKey] === undefined) {
          headers[lowerKey] = value;
        } else if (Array.isArray(headers[lowerKey])) {
          (headers[lowerKey] as string[]).push(value);
        } else {
          headers[lowerKey] = [headers[lowerKey] as string, value];
        }
      };

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (bodyStart) {
          body += line + '\n';
          continue;
        }

        // Empty line separates headers and body
        if (line === '' || line === '\r') {
          bodyStart = true;
          continue;
        }

        // Header continuations (folded header) start with space or tab
        if ((line.startsWith(' ') || line.startsWith('\t')) && currentKey) {
          const prev = Array.isArray(headers[currentKey])
            ? (headers[currentKey] as string[]).pop()!
            : (headers[currentKey] as string);
          const merged = (prev ? prev + ' ' : '') + line.trim();
          // Put merged back preserving array if it was one element
          if (Array.isArray(headers[currentKey])) {
            (headers[currentKey] as string[]).push(merged);
          } else {
            headers[currentKey] = merged;
          }
          continue;
        }

        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
          const key = line.substring(0, colonIndex).trim();
          const value = line.substring(colonIndex + 1).trim();
          currentKey = key.toLowerCase();
          commitHeader(key, value);
        }
      }

      const dateHeader = Array.isArray(headers['date']) ? headers['date'][0] : headers['date'];
      const parsedDate = dateHeader ? new Date(dateHeader) : new Date();

      return {
        messageId: Array.isArray(headers['message-id']) ? headers['message-id'][0] : headers['message-id'],
        subject: Array.isArray(headers['subject']) ? headers['subject'][0] : headers['subject'],
        from: Array.isArray(headers['from']) ? headers['from'][0] : headers['from'],
        to: Array.isArray(headers['to']) ? headers['to'][0] : headers['to'],
        date: parsedDate,
        headers,
        body,
      };
    } catch (error) {
      this.logger.error('Error parsing email headers:', error);
      return null;
    }
  }

  async getAllEmails(): Promise<Email[]> {
    return this.emailModel.find().sort({ createdAt: -1 }).exec();
  }

  async getEmailById(id: string): Promise<Email> {
    return this.emailModel.findById(id).exec();
  }

  async getEmailByMessageId(messageId: string): Promise<Email> {
    return this.emailModel.findOne({ messageId }).exec();
  }

  async getSystemStatus() {
    const totalEmails = await this.emailModel.countDocuments();
    const processedEmails = await this.emailModel.countDocuments({ status: 'processed' });
    const pendingEmails = await this.emailModel.countDocuments({ status: 'pending' });
    const errorEmails = await this.emailModel.countDocuments({ status: 'error' });

    return {
      totalEmails,
      processedEmails,
      pendingEmails,
      errorEmails,
      testEmailAddress: process.env.TEST_EMAIL_ADDRESS,
      testEmailSubject: process.env.TEST_EMAIL_SUBJECT,
      imapStatus: this.imap?.state || 'disconnected',
    };
  }
}
