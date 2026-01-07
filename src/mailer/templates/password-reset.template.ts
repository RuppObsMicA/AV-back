/**
 * Email template for password reset
 */
export class PasswordResetTemplate {
    static generate(resetUrl: string): string {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Password Reset</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background-color: #f4f4f4; padding: 20px; border-radius: 10px;">
                    <h1 style="color: #dc3545;">Password Reset Request</h1>
                    <p>You requested to reset your password. Click the button below to set a new password:</p>

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}"
                           style="display: inline-block;
                                  padding: 12px 30px;
                                  background-color: #dc3545;
                                  color: white;
                                  text-decoration: none;
                                  border-radius: 5px;
                                  font-weight: bold;">
                            Reset Password
                        </a>
                    </div>

                    <p>Or copy and paste this link into your browser:</p>
                    <p style="background-color: #fff; padding: 10px; border-radius: 5px; word-break: break-all;">
                        ${resetUrl}
                    </p>

                    <p style="color: #d9534f; font-weight: bold;">
                        ⚠️ This link expires in 1 hour.
                    </p>

                    <p style="color: #666; font-size: 14px;">
                        If you didn't request this, please ignore this email. Your password will remain unchanged.
                    </p>
                </div>
            </body>
            </html>
        `;
    }
}
