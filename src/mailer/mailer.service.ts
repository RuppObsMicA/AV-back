import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { SentMessageInfo, Transporter } from 'nodemailer';
import { EmailConfirmationTemplate } from './templates/email-confirmation.template';
import { PasswordResetTemplate } from './templates/password-reset.template';

/**
 * Service for sending emails using nodemailer
 * Handles email confirmation and password reset emails
 */
@Injectable()
export class MailerService {
    private readonly logger = new Logger(MailerService.name);
    private transporter: Transporter;
    private readonly defaultFrom: string;

    constructor() {
        this.defaultFrom = process.env.MAIL_FROM || 'noreply@yourapp.com';

        // Initialize email transporter
        this.transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST || 'smtp.ethereal.email',
            port: parseInt(process.env.MAIL_PORT || '587'),
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD,
            },
        });

        this.logger.log('MailerService initialized with host: ' + (process.env.MAIL_HOST || 'smtp.ethereal.email'));
    }

    /**
     * Send email confirmation to user with link to set password
     * @param email - User email address
     * @param confirmationHash - Unique hash for confirmation link
     * @returns Promise with email send result
     */
    async sendConfirmationEmail(email: string, confirmationHash: string): Promise<SentMessageInfo> {
        const confirmationUrl = `${process.env.FRONTEND_URL}/auth/setPassword?hash=${confirmationHash}`;

        const mailOptions = {
            from: this.defaultFrom,
            to: email,
            subject: 'Confirm your email address',
            html: EmailConfirmationTemplate.generate(confirmationUrl),
        };

        const info = await this.transporter.sendMail(mailOptions);

        this.logger.log(`Confirmation email sent to ${email}`);
        this.logger.debug(`Message ID: ${info.messageId}`);

        // Log preview URL for development (MailDev or Ethereal)
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
            this.logger.debug(`Preview URL: ${previewUrl}`);
        }

        return info;
    }

    /**
     * Send password reset email to user
     * @param email - User email address
     * @param resetHash - Unique hash for reset link
     * @returns Promise with email send result
     */
    async sendPasswordResetEmail(email: string, resetHash: string): Promise<SentMessageInfo> {
        const resetUrl = `${process.env.FRONTEND_URL}/auth/password-change?hash=${resetHash}`;

        const mailOptions = {
            from: this.defaultFrom,
            to: email,
            subject: 'Password Reset Request',
            html: PasswordResetTemplate.generate(resetUrl),
        };

        const info = await this.transporter.sendMail(mailOptions);

        this.logger.log(`Password reset email sent to ${email}`);
        this.logger.debug(`Message ID: ${info.messageId}`);

        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
            this.logger.debug(`Preview URL: ${previewUrl}`);
        }

        return info;
    }

    /**
     * Verify transporter connection (useful for health checks)
     * @returns Promise<boolean> - true if connection is successful
     */
    async verifyConnection(): Promise<boolean> {
        try {
            await this.transporter.verify();
            this.logger.log('Email transporter connection verified');
            return true;
        } catch (error) {
            this.logger.error('Email transporter connection failed', error);
            return false;
        }
    }
}
