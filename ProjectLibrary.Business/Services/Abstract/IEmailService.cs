namespace ProjectLibrary.Server.Services.Abstract
{
    public interface IEmailService
    {
        Task SendEmailAsync(string toEmail, string subject, string message);
    }
}
