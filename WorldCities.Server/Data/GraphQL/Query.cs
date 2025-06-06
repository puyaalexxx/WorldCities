using Microsoft.EntityFrameworkCore;
using WorldCities.Server.Data.DTOs;
using WorldCities.Server.Data.Models;

namespace WorldCities.Server.Data.GraphQL;

public class Query
{
    [Serial]
    [UsePaging]
    [UseFiltering]
    [UseSorting]
    public IQueryable<City> GetCities([Service] ApplicationDbContext context)
    {
        return context.Cities;
    }


    [Serial]
    [UsePaging]
    [UseFiltering]
    [UseSorting]
    public IQueryable<Country> GetCountries([Service] ApplicationDbContext context)
    {
        return context.Countries;
    }

    [Serial]
    public async Task<ApiResult<CityDTO>> GetCitiesApiResult(
        [Service] ApplicationDbContext context,
        int pageIndex = 0,
        int pageSize = 10,
        string? sortColumn = null,
        string? sortOrder = null,
        string? filterColumn = null,
        string? filterQuery = null)
    {
        return await ApiResult<CityDTO>.CreateAsync(
        context.Cities.AsNoTracking()
            .Select(c => new CityDTO()
            {
                Id = c.Id,
                Name = c.Name,
                Lat = c.Lat,
                Lon = c.Lon,
                CountryId = c.Country!.Id,
                CountryName = c.Country!.Name
            }),
            pageIndex,
            pageSize,
            sortColumn,
            sortOrder,
            filterColumn,
            filterQuery);
    }
}