import { Component, OnInit, ViewChild } from '@angular/core';
import { City } from './city';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AngularMaterialSharedModule } from '../modules/angular-material-shared.module';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { CityService } from './city.service';


@Component({
    selector: 'app-cities',
    standalone: true,
    imports: [CommonModule, HttpClientModule, AngularMaterialSharedModule, RouterModule, ],
    providers: [CityService],
    templateUrl: './cities.component.html',
    styleUrl: './cities.component.scss'
})
export class CitiesComponent implements OnInit {
    public displayedColumns: string[] = ["id", "name", "lat", "lon", "countryName"];
    public cities!: MatTableDataSource<City>;

    defaultPageIndex: number = 0;
    defaultPageSize: number = 10;
    public defaultSortColumn: string = "name";
    public defaultSortOrder: "asc" | "desc" = "asc";

    defaultFilterColumn: string = "name";
    filterQuery?: string;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    filterTextChanged: Subject<string> = new Subject<string>();

    constructor(private cityService: CityService) {
    }

    ngOnInit(){
        this.loadData();
    }

    //debouncing
    onFilterTextChanged(filterText: string){
        if(!this.filterTextChanged.observed){
            this.filterTextChanged
            .pipe(debounceTime(1000), distinctUntilChanged())
            .subscribe(query => {
                this.loadData(query);
            });
        }

        this.filterTextChanged.next(filterText);
    }

    loadData(query?: string){
        var pageEvent = new PageEvent();
        pageEvent.pageIndex = this.defaultPageIndex;
        pageEvent.pageSize = this.defaultPageSize;
        this.filterQuery = query;

        this.getData(pageEvent);
    }
    
    getData(event: PageEvent) {
        var sortColumn = (this.sort) ? this.sort.active: this.defaultSortColumn;

        var sortOrder = (this.sort) ? this.sort.direction : this.defaultSortOrder;

        var filterColumn = (this.filterQuery) ? this.defaultFilterColumn : null;

        var filterQuery = (this.filterQuery) ? this.filterQuery : null;

        this.cityService.getData(event.pageIndex, event.pageSize, sortColumn, sortOrder, filterColumn, filterQuery)
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