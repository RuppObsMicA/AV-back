/**
 * Interface for mailer transport configuration options
 */
export interface MailerTransportOptions {
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string;
        pass: string;
    };
}

/**
 * Interface for mailer module configuration
 */
export interface MailerOptions {
    transport: MailerTransportOptions;
    defaults?: {
        from?: string;
    };
}
