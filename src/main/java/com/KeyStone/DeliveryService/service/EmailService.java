package com.KeyStone.DeliveryService.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromAddress;

    @Value("${app.reset-password.url}")
    private String resetPasswordBaseUrl;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendPasswordResetEmail(String toEmail, String fullName, String resetToken) {
        String resetLink = resetPasswordBaseUrl + "?token=" + resetToken;

        String subject = "🔐 KEYSTONE – Password Reset Request";
        String htmlBody = """
                <!DOCTYPE html>
                <html>
                <head><meta charset="UTF-8"></head>
                <body style="font-family:Arial,sans-serif;background:#0f172a;margin:0;padding:0;">
                  <table width="100%%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
                    <tr><td align="center">
                      <table width="580" style="background:#1e293b;border-radius:12px;overflow:hidden;border:1px solid #334155;">
                        <tr><td style="background:linear-gradient(135deg,#1d4ed8,#7c3aed);padding:32px;text-align:center;">
                          <h1 style="color:#fff;margin:0;font-size:26px;letter-spacing:1px;">🔑 KEYSTONE FSM</h1>
                          <p style="color:#bfdbfe;margin:8px 0 0;font-size:14px;">Field Service Management Platform</p>
                        </td></tr>
                        <tr><td style="padding:40px;">
                          <h2 style="color:#f1f5f9;font-size:20px;margin:0 0 16px;">Password Reset Request</h2>
                          <p style="color:#94a3b8;line-height:1.7;margin:0 0 24px;">Hi <strong style="color:#e2e8f0;">%s</strong>,<br><br>
                          We received a request to reset the password associated with your KEYSTONE account. Click the button below to proceed.</p>
                          <div style="text-align:center;margin:32px 0;">
                            <a href="%s" style="background:linear-gradient(135deg,#1d4ed8,#7c3aed);color:#fff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:15px;font-weight:600;display:inline-block;">Reset My Password</a>
                          </div>
                          <p style="color:#64748b;font-size:13px;line-height:1.6;margin:24px 0 0;">
                            This link expires in <strong style="color:#94a3b8;">1 hour</strong>. If you did not request a password reset, please ignore this email — your account remains secure.<br><br>
                            Or copy this link: <a href="%s" style="color:#60a5fa;word-break:break-all;">%s</a>
                          </p>
                        </td></tr>
                        <tr><td style="background:#0f172a;padding:20px;text-align:center;">
                          <p style="color:#475569;font-size:12px;margin:0;">© 2026 KEYSTONE Field Service Management. All rights reserved.</p>
                        </td></tr>
                      </table>
                    </td></tr>
                  </table>
                </body>
                </html>
                """.formatted(fullName, resetLink, resetLink, resetLink);

        sendHtmlEmail(toEmail, subject, htmlBody);
        log.info("[DEV] Password reset link for {}: {}", toEmail, resetLink);
    }

    public void sendWelcomeEmail(String toEmail, String fullName, String role) {
        String subject = "🎉 Welcome to KEYSTONE – Your Account is Ready";
        String htmlBody = """
                <!DOCTYPE html>
                <html>
                <body style="font-family:Arial,sans-serif;background:#0f172a;margin:0;padding:0;">
                  <table width="100%%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
                    <tr><td align="center">
                      <table width="580" style="background:#1e293b;border-radius:12px;overflow:hidden;border:1px solid #334155;">
                        <tr><td style="background:linear-gradient(135deg,#1d4ed8,#7c3aed);padding:32px;text-align:center;">
                          <h1 style="color:#fff;margin:0;font-size:26px;letter-spacing:1px;">🔑 KEYSTONE FSM</h1>
                        </td></tr>
                        <tr><td style="padding:40px;">
                          <h2 style="color:#f1f5f9;">Welcome aboard, %s! 👋</h2>
                          <p style="color:#94a3b8;line-height:1.7;">Your KEYSTONE account has been created with the role of <strong style="color:#60a5fa;">%s</strong>.</p>
                          <p style="color:#94a3b8;line-height:1.7;">You can log in at <a href="http://localhost:5173" style="color:#60a5fa;">http://localhost:5173</a> using your registered email address.</p>
                          <p style="color:#64748b;font-size:13px;margin-top:32px;">If you have any questions, please contact your system administrator.</p>
                        </td></tr>
                        <tr><td style="background:#0f172a;padding:20px;text-align:center;">
                          <p style="color:#475569;font-size:12px;margin:0;">© 2026 KEYSTONE Field Service Management.</p>
                        </td></tr>
                      </table>
                    </td></tr>
                  </table>
                </body>
                </html>
                """.formatted(fullName, role);

        sendHtmlEmail(toEmail, subject, htmlBody);
    }

    private void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress != null ? fromAddress : "noreply@keystone.com");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("Email sent successfully to: {}", to);
        } catch (MailException | MessagingException e) {
            log.error("Failed to send email to {}: {}. Check SMTP configuration.", to, e.getMessage());
        }
    }
}
