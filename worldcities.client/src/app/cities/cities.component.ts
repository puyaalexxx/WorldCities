import { Component, OnInit, ViewChild } from '@angular/core';
import { City } from './city';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CommonModule } from '@angular/common';
import { AngularMaterialSharedModule } from '../modules/angular-material-shared.module';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

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

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    constructor(private http: HttpClient) {
    }

    ngOnInit(){
        var pageEvent = new PageEvent();
        pageEvent.pageIndex = 0;
        pageEvent.pageSize = 10

        this.getData(pageEvent);
    }
    
    getData(pageEvent: PageEvent) {
        var url = environment.baseUrl + "api/Cities";

        var params = new HttpParams()
                .set("pageIndex", pageEvent.pageIndex.toString())
                .set("pageSize", pageEvent.pageSize.toString());


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