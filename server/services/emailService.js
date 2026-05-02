const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail', // Standard approach for free MVP email
            auth: {
                user: process.env.EMAIL_USER, // e.g., your-email@gmail.com
                pass: process.env.EMAIL_PASS  // 16-character App Password
            }
        });
        console.log("📧 Email Service Initialized");
    }

    async sendDailyReport(userEmail, userName, insights) {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn("⚠️ Email not sent. Please configure EMAIL_USER and EMAIL_PASS in .env");
            return;
        }

        let htmlContent = `
            <h2>Good Morning, ${userName}!</h2>
            <p>Here is your Daily TrendPulse Report for your active trackers.</p>
            <hr />
        `;

        insights.forEach(insight => {
            htmlContent += `
                <h3>Trending: ${insight.topic}</h3>
                <p><strong>Sentiment:</strong> ${insight.sentiment}</p>
                <p>${insight.summary}</p>
                <p><em>Insight: ${insight.insight}</em></p>
                <br />
            `;
        });

        htmlContent += `<p>Upgrade to Pro for more detailed analytics and PDF reports.</p>`;

        try {
            await this.transporter.sendMail({
                from: `"TrendPulse AI" <${process.env.EMAIL_USER}>`,
                to: userEmail,
                subject: '📈 Your Daily TrendPulse Report',
                html: htmlContent
            });
            console.log(`✅ Daily report email sent to ${userEmail}`);
        } catch (error) {
            console.error("❌ Failed to send email:", error.message);
        }
    }

    async sendVerificationEmail(userEmail, userName, token) {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn("⚠️ Email not sent. Please configure EMAIL_USER and EMAIL_PASS in .env");
            return;
        }

        const verifyUrl = `http://localhost:5000/api/auth/verify/${token}`;
        
        let htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2>Welcome to TrendPulse, ${userName}!</h2>
                <p>Thank you for signing up. Please verify your email address to activate your account.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">Verify Email Address</a>
                </div>
                <p style="color: #666; font-size: 12px;">If the button doesn't work, copy and paste this link into your browser:<br>${verifyUrl}</p>
            </div>
        `;

        try {
            await this.transporter.sendMail({
                from: `"TrendPulse Team" <${process.env.EMAIL_USER}>`,
                to: userEmail,
                subject: 'Verify your TrendPulse Account',
                html: htmlContent
            });
            console.log(`✅ Verification email sent to ${userEmail}`);
        } catch (error) {
            console.error("❌ Failed to send verification email:", error.message);
        }
    }
}

module.exports = new EmailService();
