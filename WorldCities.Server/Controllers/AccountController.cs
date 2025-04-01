using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using WorldCities.Server.Data;
using WorldCities.Server.Data.Models;

namespace WorldCities.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AccountController : Controller
{
    private readonly ApplicationDbContext _context;
    private readonly JwtHandler _jwtHandler;
    private readonly UserManager<ApplicationUser> _userManager;

    // GET
    public AccountController(ApplicationDbContext context, JwtHandler jwtHandler,
        UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _jwtHandler = jwtHandler;
        _userManager = userManager;
    }

    [HttpPost("Login")]
    public async Task<IActionResult> Login(ApiLoginRequest loginRequest)
    {
        var user = await _userManager.FindByNameAsync(loginRequest.Email);

        if (user == null || !await _userManager.CheckPasswordAsync(user, loginRequest.Password))
            return Unauthorized(new ApiLoginResult
            {
                Success = false,
                Message = "Invalid Email or Password."
            });

        var secToken = await _jwtHandler.GetTokenAsync(user);

        var jwt = new JwtSecurityTokenHandler().WriteToken(secToken);

        return Ok(new ApiLoginResult
        {
            Success = true,
            Message = "Login successful",
            Token = jwt
        });
    }
}