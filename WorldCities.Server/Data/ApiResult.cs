using System.Linq.Dynamic.Core;
using System.Reflection;
using Microsoft.EntityFrameworkCore;

namespace WorldCities.Server.Data;

public class ApiResult<T>
{
    // Private constructor called by the CreateAsync method.
    private ApiResult(List<T> data, int count, int pageIndex, int pageSize,
        string? sortColumn, string? sortOrder, string? filterColumn, string? filterQuery)
    {
        Data = data;
        PageIndex = pageIndex;
        PageSize = pageSize;
        TotalCount = count;
        TotalPages = (int)Math.Ceiling(count / (double)pageSize);
        SortColumn = sortColumn;
        SortOrder = sortOrder;
        FilterColumn = filterColumn;
        FilterQuery = filterQuery;
    }

    /// <summary>
    ///     The data result.
    /// </summary>
    public List<T> Data { get; private set; }

    /// <summary>
    ///     Zero-based index of current page.
    /// </summary>
    public int PageIndex { get; }

    /// <summary>
    ///     Number of items contained in each page. ///
    /// </summary>
    public int PageSize { get; private set; }

    /// <summary>
    ///     Total items count
    /// </summary>
    public int TotalCount { get; private set; }

    /// <summary>
    ///     Total pages count
    /// </summary>
    public int TotalPages { get; }

    /// <summary>
    ///     TRUE if the current page has a previous page, /// FALSE otherwise.
    /// </summary>
    public bool HasPreviousPage => PageIndex > 0;

    /// <summary>
    ///     TRUE if the current page has a next page, FALSE otherwise. ///
    /// </summary>
    public bool HasNextPage => PageIndex + 1 < TotalPages;

    /// <summary>
    ///     Sorting Column name (or null if none set) ///
    /// </summary>
    public string? SortColumn { get; set; }

    /// <summary>
    ///     Sorting Order ("ASC", "DESC" or null if none set) ///
    /// </summary>
    public string? SortOrder { get; set; }

    /// <summary>
    ///     Filter Column name (or null if none set) ///
    /// </summary>
    public string? FilterColumn { get; set; }

    /// <summary>
    ///     Filter Query string
    ///     (to be used within the given FilterColumn) ///
    /// </summary>
    public string? FilterQuery { get; set; }

    /// <summary>
    ///     Pages a IQueryable source.
    /// </summary>
    /// <param name="source">An IQueryable source of generic /// type</param>
    /// <param name="pageIndex">Zero-based current page index /// (0 = first page)</param>
    /// <param name="pageSize">Page Size</param>
    /// <param name="sortColumn">Sort column param</param>
    /// <param name="sortOrder">Sorting order (ASC/DESC)</param>
    /// <param name="filterColumn">Column Name</param>
    /// <param name="filterQuery">Filtering query</param>
    /// <returns>
    ///     A object containing the paged result and all the relevant paging navigation info.
    /// </returns>
    public static async Task<ApiResult<T>> CreateAsync(IQueryable<T> source,
        int pageIndex, int pageSize,
        string? sortColumn = null, string? sortOrder = null,
        string? filterColumn = null, string? filterQuery = null)
    {
        if (!string.IsNullOrEmpty(filterColumn) && !string.IsNullOrEmpty(filterQuery) && IsValidProperty(filterColumn))
            source = source.Where(string.Format("{0}.StartsWith(@0)", filterColumn), filterQuery);

        var count = await source.CountAsync();

        if (!string.IsNullOrEmpty(sortColumn) && IsValidProperty(sortColumn))
        {
            sortOrder = !string.IsNullOrEmpty(sortOrder) && sortOrder.ToUpper() == "ASC" ? "ASC" : "DESC";

            source = source.OrderBy(string.Format("{0} {1}", sortColumn, sortOrder));
        }

        source = source
            .Skip(pageIndex * pageSize)
            .Take(pageSize);

        /*#if DEBUG
            //retrieve the sql query (debugging purposes)
            var sql = source.ToParametrizedSql();
        #endif*/

        var data = await source.ToListAsync();

        return new ApiResult<T>(data, count, pageIndex, pageSize, sortColumn, sortOrder, filterColumn, filterQuery);
    }

    /// <summary>
    ///     Checks if the given property name exists
    ///     to protect against SQL injection attacks
    /// </summary>
    public static bool IsValidProperty(string propertyName, bool throwExceptionIfNotFound = true)
    {
        var prop = typeof(T).GetProperty(propertyName,
            BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance);

        if (prop == null && throwExceptionIfNotFound)
            throw new NotSupportedException(string.Format($"ERROR: Property '{propertyName}' does not exist."));

        return prop != null;
    }
}