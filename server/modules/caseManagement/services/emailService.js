const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.log('Email connection error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Send case creation notification to client
const sendCaseCreationEmail = async (clientEmail, clientName, caseDetails) => {
  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'Legal Firm'}" <${process.env.EMAIL_USER}>`,
    to: clientEmail,
    subject: 'New Case Registered - Legal Firm',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #D4AF37 0%, #B8960C 100%); padding: 30px; text-align: center;">
          <h1 style="color: #0A0A0A; margin: 0; font-size: 28px;">Legal Firm</h1>
        </div>
        
        <div style="padding: 30px; background-color: #ffffff;">
          <h2 style="color: #0A0A0A; margin-top: 0;">New Case Registered</h2>
          <p style="color: #4B5563; font-size: 16px;">Dear ${clientName},</p>
          <p style="color: #4B5563; font-size: 16px;">A new case has been successfully registered in our system. Here are the details:</p>
          
          <div style="background-color: #F5F5F5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6B7280; font-weight: bold;">Case Number:</td>
                <td style="padding: 8px 0; color: #0A0A0A; font-weight: bold;">${caseDetails.caseNumber}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6B7280;">Title:</td>
                <td style="padding: 8px 0; color: #0A0A0A;">${caseDetails.title}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6B7280;">Type:</td>
                <td style="padding: 8px 0; color: #0A0A0A;">${caseDetails.caseType}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6B7280;">Status:</td>
                <td style="padding: 8px 0; color: #0A0A0A;">${caseDetails.status}</td>
              </tr>
              ${caseDetails.hearingDate ? `
              <tr>
                <td style="padding: 8px 0; color: #6B7280;">Hearing Date:</td>
                <td style="padding: 8px 0; color: #0A0A0A;">${new Date(caseDetails.hearingDate).toLocaleDateString()}</td>
              </tr>
              ` : ''}
            </table>
          </div>
          
          ${caseDetails.description ? `
            <p style="color: #4B5563; font-size: 16px;"><strong>Description:</strong></p>
            <p style="color: #4B5563; font-size: 14px;">${caseDetails.description}</p>
          ` : ''}
          
          <p style="color: #4B5563; font-size: 16px; margin-top: 30px;">Our team will review your case and contact you shortly. If you have any questions, please don't hesitate to reach out.</p>
          
          <p style="color: #4B5563; font-size: 16px;">Best regards,<br/><strong style="color: #D4AF37;">Legal Firm Team</strong></p>
        </div>
        
        <div style="background-color: #0A0A0A; padding: 20px; text-align: center; color: #9CA3AF; font-size: 12px;">
          <p style="margin: 0;">&copy; ${new Date().getFullYear()} Legal Firm. All rights reserved.</p>
          <p style="margin: 5px 0 0 0;">This is an automated message, please do not reply.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Case creation email sent to ${clientEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending case creation email:', error);
    return false;
  }
};

module.exports = {
  sendCaseCreationEmail
};
