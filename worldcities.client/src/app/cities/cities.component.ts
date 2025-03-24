import { Component, OnInit, ViewChild } from '@angular/core';
import { City } from './city';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CommonModule } from '@angular/common';
import { AngularMaterialSharedModule } from '../modules/angular-material-shared.module';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-cities',
  standalone: true,
  imports: [CommonModule, HttpClientModule, AngularMaterialSharedModule],
  templateUrl: './cities.component.html',
  styleUrl: './cities.component.scss'
})
export class CitiesComponent implements OnInit {
    public displayedColumns: string[] = ["id", "name", "lat", "lon"];
    public cities!: MatTableDataSource<City>;

    defaultPageIndex: number = 0;
    defaultPageSize: number = 10;
    public defaultSortColumn: string = "name";
    public defaultSortOrder: "asc" | "desc" = "asc";

    defaultFilterColumn: string = "name";
    filterQuery?: string;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(private http: HttpClient) {
    }

    ngOnInit(){
        this.loadData();
    }

    loadData(query?: string){
        var pageEvent = new PageEvent();
        pageEvent.pageIndex = this.defaultPageIndex;
        pageEvent.pageSize = this.defaultPageSize;
        this.filterQuery = query;

        this.getData(pageEvent);
    }
    
    getData(pageEvent: PageEvent) {
        var url = environment.baseUrl + "api/Cities";

        var params = new HttpParams()
                .set("pageIndex", pageEvent.pageIndex.toString())
                .set("pageSize", pageEvent.pageSize.toString())
                .set("sortColumn", (this.sort)
                    ? this.sort.active
                    : this.defaultSortColumn)
                .set("sortOrder", (this.sort)
                    ? this.sort.direction
                    : this.defaultSortOrder);

        if(this.filterQuery){
            params = params
                .set("filterColumn", this.defaultFilterColumn)
                .set("filterQuery", this.filterQuery);
        }

        this.http.get<any>(url, {params})
        .subscribe({
            next: (result) => {
                this.paginator.length = result.totalCount;
                this.paginator.pageIndex = result.pageIndex;
                this.paginator.pageSize = result.pageSize;
                this.cities = new MatTableDataSource<City>(result.data);
            },
            error: (error) => console.error(error)
          });
    }
}