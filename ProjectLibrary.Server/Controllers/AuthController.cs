using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using ProjectLibrary.Entities.Concrete;
using ProjectLibrary.Entities.Dtos;

namespace LibraryManagement.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly IConfiguration _configuration;

        public AuthController(UserManager<User> userManager, SignInManager<User> signInManager, IConfiguration configuration)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto model)
        {
            if (model == null || string.IsNullOrWhiteSpace(model.Email) || string.IsNullOrWhiteSpace(model.Password))
            {
                return BadRequest(new { message = "Məlumatlar tam daxil edilməyib." });
            }

            var parts = model.Email.Split('@');
            if (parts.Length != 2)
            {
                return BadRequest(new { message = "Düzgün e-mail ünvanı daxil edin." });
            }

            var emailDomain = parts[1].ToLower();
            var allowedDomains = new List<string> { "gmail.com", "outlook.com", "mail.ru", "library.com", "code.edu.az" };

            if (!allowedDomains.Contains(emailDomain))
            {
                return BadRequest(new { message = "Yalnız aşağıdakı e-mail domenlərinə icazə verilir: gmail.com, outlook.com, mail.ru, library.com" });
            }

            var existingUser = await _userManager.FindByEmailAsync(model.Email);
            if (existingUser != null)
            {
                return BadRequest(new { message = "Bu e-mail ilə artıq qeydiyyat mövcuddur." });
            }

            var role = LibraryConstants.Roles.User;

            var user = new User
            {
                UserName = parts[0] + "_" + Guid.NewGuid().ToString("N")[..4],
                Email = model.Email,
                FullName = model.FullName,
                Role = role
            };

            var result = await _userManager.CreateAsync(user, model.Password);
            if (!result.Succeeded)
            {
                var errorMsg = result.Errors.FirstOrDefault()?.Description ?? "Qeydiyyat zamanı xəta baş verdi.";
                return BadRequest(new { message = errorMsg, errors = result.Errors });
            }

            await _userManager.AddToRoleAsync(user, role);

            return Ok(new { message = "İstifadəçi uğurla qeydiyyatdan keçdi! İndi daxil ola bilərsiniz." });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto model)
        {
            if (model == null || string.IsNullOrWhiteSpace(model.Email) || string.IsNullOrWhiteSpace(model.Password))
            {
                return BadRequest(new { message = "Email və şifrə tələb olunur." });
            }

            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                return Unauthorized(new { message = "Email və ya şifrə yanlışdır." });
            }

            var isValidPassword = await _userManager.CheckPasswordAsync(user, model.Password);
            if (!isValidPassword)
            {
                return Unauthorized(new { message = "Email və ya şifrə yanlışdır." });
            }

            var token = GenerateJwtToken(user);

            return Ok(new
            {
                token,
                user = new
                {
                    id = user.Id,
                    email = user.Email,
                    fullName = user.FullName,
                    role = user.Role
                }
            });
        }

        private string GenerateJwtToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id),
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Name, user.UserName ?? user.Email ?? ""),
                new Claim(ClaimTypes.Email, user.Email ?? ""),
                new Claim(ClaimTypes.Role, user.Role ?? LibraryConstants.Roles.User)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? "SecretKeyDefaultMustBeLongEnough123456"));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
