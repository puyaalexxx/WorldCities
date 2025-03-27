using Microsoft.EntityFrameworkCore;
using WorldCities.Server.Controllers;
using WorldCities.Server.Data;
using WorldCities.Server.Data.Models;
using Xunit;

namespace WorldCities.Server.Tests;

public class CitiesController_Tests
{
    [Fact]
    public async Task GetCity()
    {
        //arrange
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: "WorldCities")
            .Options;
        
        using var context = new ApplicationDbContext(options);
        context.Add(new City()
        {
            Id = 1,
            Name = "RestCity1",
            CountryId = 1,
            Lat = 1,
            Lon = 1
        });

        context.SaveChanges();

        var controller = new CitiesController(context);
        City? city_existing = null;
        City? city_notExisting = null;

        //act
        city_existing = (await controller.GetCity(1)).Value;
        city_notExisting = (await controller.GetCity(2)).Value;

        //assert
        Assert.NotNull(city_existing);
        Assert.Null(city_notExisting);
        //Assert.Null(city_existing);
    }
}