const nodemailer = require('nodemailer');

// Initialize transporter conditionally to prevent crashes if credentials aren't set
let transporter = null;

if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  try {
    transporter = nodemailer.createTransport({
      service: 'gmail', // Uses default Gmail SMTP settings
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    console.log('Nodemailer SMTP email transporter initialized successfully.');
  } catch (err) {
    console.error('Failed to initialize email transporter:', err.message);
  }
} else {
  console.warn('EMAIL_USER or EMAIL_PASSWORD not found in environment variables.');
  console.warn('Email dispatch will run in SIMULATION/console-only mode.');
}

/**
 * Dispatch verification email to student
 * @param {string} studentEmail - The student's email address
 * @param {string} studentName - The student's name
 * @param {string} verifyUrl - The activation URL
 */
exports.sendVerificationEmail = async (studentEmail, studentName, verifyUrl) => {
  const htmlContent = `
    <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #f1f5f9; padding: 40px 20px; color: #1e293b; line-height: 1.6;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #e2e8f0;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%); padding: 30px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.02em;">Sindh Educational Academy</h1>
          <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Unlock Your Potential • MDCAT, ECAT & Board Prep</p>
        </div>
        
        <!-- Body -->
        <div style="padding: 45px 35px; background-color: #ffffff;">
          <h2 style="margin-top: 0; margin-bottom: 20px; font-size: 20px; font-weight: 700; color: #0f172a;">Welcome to the Academy, ${studentName}!</h2>
          <p style="margin-bottom: 25px; color: #475569; font-size: 15px;">
            Thank you for registering at the SEA preparatory web portal. To complete your registration and activate your student portal workspace, please confirm your email address by clicking the button below:
          </p>
          
          <div style="text-align: center; margin: 35px 0;">
            <a href="${verifyUrl}" target="_blank" style="display: inline-block; padding: 14px 30px; font-size: 15px; font-weight: 600; color: #ffffff; background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%); border-radius: 10px; text-decoration: none; box-shadow: 0 4px 15px rgba(139, 92, 246, 0.35); transition: all 0.2s;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #64748b; font-size: 13px; text-align: center; margin-bottom: 30px;">
            This link is valid for 24 hours. If you did not sign up for this account, please ignore this email.
          </p>
          
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
          
          <p style="color: #94a3b8; font-size: 12px; line-height: 1.4; margin: 0;">
            If the button above does not work, copy and paste this URL into your web browser:<br />
            <a href="${verifyUrl}" target="_blank" style="color: #3b82f6; text-decoration: underline; word-break: break-all;">${verifyUrl}</a>
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0;">&copy; ${new Date().getFullYear()} Sindh Educational Academy (SEA), Ghotki. All rights reserved.</p>
        </div>
      </div>
    </div>
  `;

  if (!transporter) {
    console.log('\n--- [EMAIL DISPATCH SIMULATOR] ---');
    console.log(`To: ${studentEmail}`);
    console.log(`Subject: Verify your Sindh Educational Academy Account`);
    console.log(`Link: ${verifyUrl}`);
    console.log('----------------------------------\n');
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Sindh Educational Academy" <${process.env.EMAIL_USER}>`,
      to: studentEmail,
      subject: 'Verify your Sindh Educational Academy Account',
      html: htmlContent,
    });
    console.log(`Verification email sent successfully to ${studentEmail}`);
  } catch (error) {
    console.error(`Failed to send verification email to ${studentEmail}:`, error);
    throw error;
  }
};
