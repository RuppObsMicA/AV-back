/**
 * Email template for user registration confirmation
 */
export class EmailConfirmationTemplate {
    static generate(confirmationUrl: string): string {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Confirm Your Email</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background-color: #f4f4f4; padding: 20px; border-radius: 10px;">
                    <h1 style="color: #007bff;">Welcome to Our App!</h1>
                    <p>Thank you for registering. Please confirm your email address by clicking the button below:</p>

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${confirmationUrl}"
                           style="display: inline-block;
                                  padding: 12px 30px;
                                  background-color: #007bff;
                                  color: white;
                                  text-decoration: none;
                                  border-radius: 5px;
                                  font-weight: bold;">
                            Confirm Email & Set Password
                        </a>
                    </div>

                    <p>Or copy and paste this link into your browser:</p>
                    <p style="background-color: #fff; padding: 10px; border-radius: 5px; word-break: break-all;">
                        ${confirmationUrl}
                    </p>

                    <p style="color: #d9534f; font-weight: bold;">
                        ⚠️ This link expires in 24 hours.
                    </p>

                    <p style="color: #666; font-size: 14px;">
                        If you didn't request this, please ignore this email.
                    </p>
                </div>
            </body>
            </html>
        `;
    }
}
