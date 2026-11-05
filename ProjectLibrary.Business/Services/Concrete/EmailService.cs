using Microsoft.Extensions.Options;
using MimeKit;

using ProjectLibrary.Server.Services.Abstract;
using System.Net.Mail;
//using mailkit.net.smtp;
//using mailkit.security;
using MimeKit;
using ProjectLibrary.Entities.Dtos;

namespace ProjectLibrary.Business.Services.Concrete
{
    
        public class EmailService : IEmailService
        {
            private readonly Entities.Dtos.EmailSettings _emailSettings;

            public EmailService(IOptions<EmailSettings> emailSettings)
            {
                _emailSettings = emailSettings.Value;
            }

            public async Task SendEmailAsync(string toEmail, string subject, string message)
            {
                var emailMessage = new MimeMessage();
                emailMessage.From.Add(new MailboxAddress("Library Management", _emailSettings.SenderEmail));
                emailMessage.To.Add(new MailboxAddress("", toEmail));
                emailMessage.Subject = subject;

                var bodyBuilder = new BodyBuilder { HtmlBody = message };
                emailMessage.Body = bodyBuilder.ToMessageBody();

                using (var client = new MailKit.Net.Smtp.SmtpClient())
                {
                    try
                    {
                        await client.ConnectAsync(_emailSettings.SmtpServer, _emailSettings.Port, MailKit.Security.SecureSocketOptions.StartTls);
                        await client.AuthenticateAsync(_emailSettings.SenderEmail, _emailSettings.SenderPassword);
                        await client.SendAsync(emailMessage);
                        await client.DisconnectAsync(true);
                    
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Email sending failed: {ex.Message}");
                    }
                }
            }
        }
    
}
