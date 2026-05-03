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
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;

        const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';
        const verifyUrl = `${serverUrl}/api/auth/verify/${token}`;
        
        const htmlContent = `
            <div style="font-family: 'Inter', sans-serif; background-color: #f8fafc; padding: 40px 20px;">
                <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                    <div style="background: #020617; padding: 30px; text-align: center;">
                        <h1 style="color: #10b981; margin: 0; font-size: 24px; letter-spacing: -0.5px;">TrendPulse</h1>
                    </div>
                    <div style="padding: 40px 30px;">
                        <h2 style="color: #0f172a; margin: 0 0 16px; font-size: 20px;">Verify your account</h2>
                        <p style="color: #64748b; line-height: 1.6; margin-bottom: 30px;">Hi ${userName}, welcome to TrendPulse! To start tracking trends with AI, please verify your email address below.</p>
                        <div style="text-align: center; margin-bottom: 30px;">
                            <a href="${verifyUrl}" style="background: #10b981; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">Verify Email Address</a>
                        </div>
                        <p style="color: #94a3b8; font-size: 13px; text-align: center; margin: 0;">This link will expire in 24 hours.</p>
                    </div>
                    <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #f1f5f9;">
                        <p style="color: #94a3b8; font-size: 12px; margin: 0;">&copy; 2026 TrendPulse AI. All rights reserved.</p>
                    </div>
                </div>
            </div>
        `;

        try {
            await this.transporter.sendMail({
                from: `"TrendPulse" <${process.env.EMAIL_USER}>`,
                to: userEmail,
                subject: 'Verify your TrendPulse Account',
                html: htmlContent
            });
            console.log(`✅ Premium verification email sent to ${userEmail}`);
        } catch (error) {
            console.error("❌ Email error:", error.message);
        }
    }

    async sendWelcomeEmail(userEmail, userName) {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;

        const htmlContent = `
            <div style="font-family: 'Inter', sans-serif; background-color: #f8fafc; padding: 40px 20px;">
                <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                    <div style="background: #020617; padding: 30px; text-align: center;">
                        <h1 style="color: #10b981; margin: 0; font-size: 24px;">Welcome to TrendPulse</h1>
                    </div>
                    <div style="padding: 40px 30px;">
                        <h2 style="color: #0f172a; margin: 0 0 16px; font-size: 22px;">You're in, ${userName}!</h2>
                        <p style="color: #64748b; line-height: 1.6; margin-bottom: 24px;">Your account is officially verified. You can now use AI to track trends, analyze sentiment, and stay ahead of the curve.</p>
                        <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin-bottom: 30px;">
                            <p style="color: #166534; font-size: 14px; margin: 0;"><strong>Pro Tip:</strong> Try saying "Track OpenAI news daily" in the AI Assistant to get started.</p>
                        </div>
                        <div style="text-align: center;">
                            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}" style="background: #0f172a; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">Go to Dashboard</a>
                        </div>
                    </div>
                    <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #f1f5f9;">
                        <p style="color: #94a3b8; font-size: 12px; margin: 0;">&copy; 2026 TrendPulse AI. Follow us on Twitter for updates.</p>
                    </div>
                </div>
            </div>
        `;

        try {
            await this.transporter.sendMail({
                from: `"TrendPulse" <${process.env.EMAIL_USER}>`,
                to: userEmail,
                subject: '🚀 Welcome to TrendPulse AI!',
                html: htmlContent
            });
            console.log(`✅ Welcome email sent to ${userEmail}`);
        } catch (error) {
            console.error("❌ Welcome email error:", error.message);
        }
    }
}

module.exports = new EmailService();
