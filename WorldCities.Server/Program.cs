using Microsoft.EntityFrameworkCore;
using Serilog;
using Serilog.Events;
using Serilog.Sinks.MSSqlServer;
using WorldCities.Server.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers().AddJsonOptions(options => { options.JsonSerializerOptions.WriteIndented = true; });

builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
});

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
}

app.UseHttpsRedirection();
app.MapControllers();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.UseSerilogRequestLogging();

app.Run();