using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using Serilog.Events;
using Serilog.Sinks.MSSqlServer;
using WorldCities.Server.Data;
using WorldCities.Server.Data.GraphQL;
using WorldCities.Server.Data.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers().AddJsonOptions(options => { options.JsonSerializerOptions.WriteIndented = true; });

builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
});

// Add ASP.NET Core Identity support
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
    {
        options.SignIn.RequireConfirmedAccount = true;
        options.Password.RequireDigit = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireUppercase = true;
        options.Password.RequireNonAlphanumeric = true;
        options.Password.RequiredLength = 8;
    })
    .AddEntityFrameworkStores<ApplicationDbContext>();

//add authentication services and middlewares
builder.Services.AddAuthentication(opt =>
{
    opt.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    opt.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        RequireExpirationTime = true,
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
        ValidAudience = builder.Configuration["JwtSettings:Audience"],
        IssuerSigningKey =
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:SecurityKey"]!))
    };
});

builder.Services.AddGraphQLServer()
    .AddAuthorization()
    .AddQueryType<Query>()
    .AddMutationType<Mutation>()
    .AddFiltering()
    .AddSorting();

builder.Services.AddScoped<JwtHandler>();

builder.Host.UseSerilog((ctx, lc) => lc
    .ReadFrom.Configuration(ctx.Configuration)
    .WriteTo.MSSqlServer(
        ctx.Configuration.GetConnectionString("DefaultConnection"),
        restrictedToMinimumLevel: LogEventLevel.Information,
        sinkOptions: new MSSqlServerSinkOptions
        {
            TableName = "LogEvents",
            AutoCreateSqlTable = true
        }).WriteTo.Console()
);

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI( /*options =>
{
    var descriptions = app.DescribeApiVersions();
    foreach (var description in descriptions)
        options.SwaggerEndpoint($"/swagger/{description.GroupName}/swagger.json",
            $"MyBGList {description.GroupName.ToUpperInvariant()}");

    options.RoutePrefix =
        string.Empty; // Swagger UI at the root (remove swagger from https://localhost:7074/swagger/index.html)
}*/);

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI( /*options =>
    {
        var descriptions = app.DescribeApiVersions();
        foreach (var description in descriptions)
            options.SwaggerEndpoint($"/swagger/{description.GroupName}/swagger.json",
                $"MyBGList {description.GroupName.ToUpperInvariant()}");

        options.RoutePrefix =
            string.Empty; // Swagger UI at the root (remove swagger from https://localhost:7074/swagger/index.html)
    }*/);

    app.UseDeveloperExceptionPage();
}
else
{
    app.UseExceptionHandler("/error");
    app.MapGet("/Error", () => Results.Problem());
    app.UseHsts();
}

app.UseHttpsRedirection();
app.MapControllers();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapGraphQL("/api/graphql");
app.UseSerilogRequestLogging();

app.Run();