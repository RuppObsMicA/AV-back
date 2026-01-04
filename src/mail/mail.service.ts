import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter;

    constructor() {
        // Transport configuration (for development - Ethereal Email)
        this.transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST || 'smtp.ethereal.email',
            port: parseInt(process.env.MAIL_PORT || '587'),
            secure: false,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD,
            },
        });
    }

    async sendConfirmationEmail(email: string, confirmationHash: string) {
        const confirmationUrl = `${process.env.FRONTEND_URL}/auth/setPassword?hash=${confirmationHash}`;

        const mailOptions = {
            from: process.env.MAIL_FROM || 'noreply@yourapp.com',
            to: email,
            subject: 'Confirm your email address',
            html: `
                <h1>Welcome to Our App!</h1>
                <p>Thank you for registering. Please confirm your email address by clicking the link below:</p>
                <a href="${confirmationUrl}" style="
                    display: inline-block;
                    padding: 10px 20px;
                    background-color: #007bff;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                ">Confirm Email & Set Password</a>
                <p>Or copy this link to your browser:</p>
                <p>${confirmationUrl}</p>
                <p><strong>This link expires in 24 hours.</strong></p>
                <p>If you didn't request this, please ignore this email.</p>
            `,
        };

        const info = await this.transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
        return info;
    }

    async sendPasswordResetEmail(email: string, resetHash: string) {
        const resetUrl = `${process.env.FRONTEND_URL}/auth/password-change?hash=${resetHash}`;

        const mailOptions = {
            from: process.env.MAIL_FROM || 'noreply@yourapp.com',
            to: email,
            subject: 'Password Reset Request',
            html: `
                <h1>Password Reset</h1>
                <p>You requested to reset your password. Click the link below to set a new password:</p>
                <a href="${resetUrl}" style="
                    display: inline-block;
                    padding: 10px 20px;
                    background-color: #dc3545;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                ">Reset Password</a>
                <p>Or copy this link to your browser:</p>
                <p>${resetUrl}</p>
                <p><strong>This link expires in 1 hour.</strong></p>
                <p>If you didn't request this, please ignore this email. Your password will remain unchanged.</p>
            `,
        };

        const info = await this.transporter.sendMail(mailOptions);
        console.log('Password reset email sent:', info.messageId);
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
        return info;
    }
}
