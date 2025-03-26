import { Component, OnInit } from '@angular/core';
import { AsyncValidatorFn, FormControl, FormGroup, ReactiveFormsModule, Validators, AbstractControl, AsyncValidator } from '@angular/forms';
import { City } from './city';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';
import { AngularMaterialSharedModule } from '../modules/angular-material-shared.module';
import { Country } from '../countries/country';
import { map, Observable } from 'rxjs';
import { BaseFormComponent } from '../base-form.component';
import { CityService } from './city.service';

@Component({
    selector: 'app-city-edit',
    standalone: true,
    imports: [ReactiveFormsModule,CommonModule, HttpClientModule, AngularMaterialSharedModule, RouterModule],
    providers: [CityService],
    templateUrl: './city-edit.component.html',
    styleUrl: './city-edit.component.scss'
})
export class CityEditComponent extends BaseFormComponent implements OnInit {
    title?: string;

    city?: City;

    // the city object id, as fetched from the active route: // It's NULL when we're adding a new city,
    // and not NULL when we're editing an existing one.
    id?: number;

    //dropdown with countries
    countries?: Country[];

    constructor(
        private activatedRoute: ActivatedRoute, 
        private router: Router, 
        private cityService: CityService) {
        super();
    }

    ngOnInit(): void {
        this.form = new FormGroup({
            name: new FormControl('', Validators.required),
            lat: new FormControl('', [
                Validators.required,
                Validators.pattern(/^[-]?[0-9]+(\.[0-9]{1,4})?$/)
            ]),
            lon: new FormControl('', [
                Validators.required,
                Validators.pattern(/^[-]?[0-9]+(\.[0-9]{1,4})?$/)
            ]),
            countryId: new FormControl('', Validators.required)
        }, null, this.isDupeCity());

        this.loadData();
    }

    loadData(){

        this.loadCountries();

        // retrieve the ID from the 'id' parameter
        var idParam = this.activatedRoute.snapshot.paramMap.get('id');
        this.id = idParam ? +idParam : 0;

        // EDIT MODE
        if (this.id) {
            // fetch the city from the server
            this.cityService.get(this.id)
            .subscribe({
                next: (result) => {
                    this.city = result;
                    this.title = "Edit - " + this.city.name;

                    // update the form with the city value
                    this.form.patchValue(this.city);
                },
                error: (error) => console.error(error)
            });
        }
        // ADD NEW MODE
        else {
            this.title = "Create a new City";
        }
    }

    loadCountries() {
        // fetch all the countries from the server
        this.cityService.getCountries(0,9999,"name","asc",null, null)
        .subscribe({
            next: (result) => {
                this.countries = result.data;
            },
            error: (error) => console.error(error)
        });
    }

    onSubmit(){
        var city = (this.id) ? this.city : <City>{};

        if(city){
            city.name = this.form.controls['name'].value;
            city.lat = +this.form.controls['lat'].value;
            city.lon = +this.form.controls['lon'].value;
            city.countryId = +this.form.controls['countryId'].value;

            // EDIT mode
            if (this.id) { 
                this.cityService.put(city)
                .subscribe({
                    next: (result) => {
                        console.log("City " + city!.id + " has been updated.");

                        // go back to cities view
                        this.router.navigate(['/cities']);
                    },
                    error: (error) => console.error(error)
                });
            }
            // ADD NEW mode
            else {
                this.cityService.post(city)
                .subscribe({
                    next: (result) => {
                        console.log("City " + result.id + " has been created.");

                        // go back to cities view
                        this.router.navigate(['/cities']);
                    },
                    error: (error) => console.error(error)
                });
            }
        }
    }

    //custom validator
    isDupeCity(): AsyncValidatorFn{
        return (control: AbstractControl) : Observable<{[key: string] : any} | null> => {
            var city = <City>{};

            city.id = (this.id) ? this.id : 0;
            city.name = this.form.controls['name'].value;
            city.lat = +this.form.controls['lat'].value;
            city.lon = +this.form.controls['lon'].value;
            city.countryId = +this.form.controls['countryId'].value;

            var url = environment.baseUrl + 'api/Cities/IsDupeCity';

            return this.cityService.isDupeCity(city).pipe(map(result => {
                return (result ? { isDupeCity: true } : null);
            }));
        };
    }
}
