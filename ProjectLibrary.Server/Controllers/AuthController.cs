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
            // İcazə verilən domenlər
            var allowedDomains = new List<string> { "gmail.com", "outlook.com", "mail.ru" };

            
            var emailDomain = model.Email.Split('@').Last().ToLower();

            
            if (!allowedDomains.Contains(emailDomain))
            {
                return BadRequest(new { message = "Yalnız aşağıdakı e-mail domenlərinə icazə verilir: gmail.com, outlook.com, mail.ru" });
            }

            // Eyni e-mail ilə istifadəçi varsa
            var existingUser = await _userManager.FindByEmailAsync(model.Email);
            if (existingUser != null)
            {
                return BadRequest(new { message = "Bu email ilə artıq qeydiyyat mövcuddur." });
            }

            var user = new User
            {
                UserName = model.Email.Split('@')[0],
                Email = model.Email,
                FullName = model.FullName,
                Role = "User"
            };

            var result = await _userManager.CreateAsync(user, model.Password);

            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok(new { message = "İstifadəçi uğurla qeydiyyatdan keçdi!" });
        }


        //[HttpPost("login")]
        //public async Task<IActionResult> Login([FromBody] LoginDto model)
        //{
        //    var user = await _userManager.FindByEmailAsync(model.Email);
        //    if (user == null)
        //        return Unauthorized("Invalid email or password");

        //    var result = await _signInManager.PasswordSignInAsync(user.Email, model.Password, false, false);
        //    if (!result.Succeeded)
        //        return Unauthorized("Invalid email or password");

        //    var token = GenerateJwtToken(user);
        //    return Ok(new { token });
        //}

        //[HttpPost("login")]
        //public async Task<IActionResult> Login([FromBody] LoginDto model)
        //{
        //    var user = await _userManager.FindByEmailAsync(model.Email);
        //    if (user == null)
        //        return Unauthorized("Invalid credentials");

        //    var isValidPassword = await _userManager.CheckPasswordAsync(user, model.Password);
        //    if (!isValidPassword)
        //        return Unauthorized("Invalid credentials");

        //    var token = GenerateJwtToken(user);
        //    return Ok(new { token });
        //}

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
                return Unauthorized(new { message = "Invalid credentials" });

            var isValidPassword = await _userManager.CheckPasswordAsync(user, model.Password);
            if (!isValidPassword)
                return Unauthorized(new { message = "Invalid credentials" });
            var role = user.Role;
            var token = GenerateJwtToken(user);
            return Ok(new
            {
                token,
                user = new
                {
                    user.Id,
                    user.Email,
                    user.FullName,
                    //user.Role
                    role
                }
            });
        }

        private string GenerateJwtToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                _configuration["Jwt:Issuer"],
                _configuration["Jwt:Audience"],
                claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}