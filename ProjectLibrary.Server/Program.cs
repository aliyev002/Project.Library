using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using ProjectLibrary.Business.Services.Abstract;
using ProjectLibrary.Business.Services.Concrete;
using ProjectLibrary.DataAccess.Data;
using ProjectLibrary.Entities.Concrete;
using ProjectLibrary.Entities.Dtos;
using ProjectLibrary.Server.Hubs;
using ProjectLibrary.Server.Middlewares;
using ProjectLibrary.Server.Services.Abstract;
using ProjectLibrary.Server.Services.Concrete;

var builder = WebApplication.CreateBuilder(args);

// 1. Controllers & JSON Options
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

builder.Services.AddEndpointsApiExplorer();

// 2. Swagger Gen with Bearer Token Support
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Kitabxana İdarəetmə Sistemi API", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Məsələn: 'Bearer 12345abcdef'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// 3. Database Context
var conn = builder.Configuration.GetConnectionString("Default");
builder.Services.AddDbContext<LibraryDbContext>(opt =>
{
    opt.UseSqlServer(conn);
});

// 4. ASP.NET Core Identity
builder.Services.AddIdentity<User, IdentityRole>(options =>
{
    options.Password.RequireDigit = false;
    options.Password.RequireLowercase = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 6;
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<LibraryDbContext>()
.AddDefaultTokenProviders();

// 5. JWT Authentication
var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.UTF8.GetBytes(jwtSettings["Key"] ?? "SecretKeyDefaultMustBeLongEnough123456");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        ClockSkew = TimeSpan.Zero
    };
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();

// 6. SignalR Service
builder.Services.AddSignalR();

// 7. Application & Business Services
builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("EmailSettings"));
builder.Services.AddTransient<ProjectLibrary.Server.Services.Abstract.IEmailService, ProjectLibrary.Business.Services.Concrete.EmailService>();

builder.Services.AddScoped<IBookService, BookService>();
builder.Services.AddScoped<IReviewService, ReviewService>();
builder.Services.AddScoped<IWishlistService, WishlistService>();
builder.Services.AddScoped<IPenaltyService, PenaltyService>();
builder.Services.AddScoped<ISuggestionService, SuggestionService>();
builder.Services.AddScoped<IRoomBookingService, RoomBookingService>();
builder.Services.AddScoped<IAuditService, AuditService>();
builder.Services.AddScoped<INotificationService, NotificationService>();

// 8. Background Services
builder.Services.AddHostedService<ReservationBackgroundService>();
builder.Services.AddHostedService<BorrowReminderService>();

// 9. Dynamic CORS Policy for Local Development
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                  "https://localhost:5173",
                  "http://localhost:5173",
                  "https://localhost:5174",
                  "http://localhost:5174",
                  "http://localhost:3000"
              )
              .SetIsOriginAllowed(origin =>
              {
                if (string.IsNullOrEmpty(origin)) return false;
                return Uri.TryCreate(origin, UriKind.Absolute, out var uri) &&
                       (uri.Host == "localhost" || uri.Host == "127.0.0.1");
            })
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// 10. Middleware Pipeline
app.UseMiddleware<ExceptionMiddleware>();
app.UseCors("AllowFrontend");

app.UseDefaultFiles();
app.UseStaticFiles();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Kitabxana API V1");
    });
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<NotificationHub>("/hubs/notifications");
app.MapFallbackToFile("/index.html");

// 11. Database Migration & Seed on Startup
try
{
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<LibraryDbContext>();
        // Verilənlər bazasını avtomatik miqrasiya et / təmin et
        db.Database.EnsureCreated();
    }
    await DataSeeder.SeedAsync(app.Services);
}
catch (Exception ex)
{
    Console.WriteLine($"[DataSeeder] Xəta baş verdi: {ex.Message}");
}

app.Run();
