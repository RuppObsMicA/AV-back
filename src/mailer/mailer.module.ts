import { Module } from '@nestjs/common';
import { MailerService } from './mailer.service';

/**
 * Module for email functionality
 * Provides MailerService for sending emails
 */
@Module({
    providers: [MailerService],
    exports: [MailerService],
})
export class MailerModule {}
