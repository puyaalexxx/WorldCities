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

@Component({
  selector: 'app-city-edit',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule, HttpClientModule, AngularMaterialSharedModule, RouterModule],
  templateUrl: './city-edit.component.html',
  styleUrl: './city-edit.component.scss'
})
export class CityEditComponent implements OnInit {
    title?: string;

    form!: FormGroup;

    city?: City;

    // the city object id, as fetched from the active route: // It's NULL when we're adding a new city,
    // and not NULL when we're editing an existing one.
    id?: number;

    //dropdown with countries
    countries?: Country[];

    constructor(private activatedRoute: ActivatedRoute, private router: Router, private http: HttpClient) {
    }

    ngOnInit(): void {
        this.form = new FormGroup({
            name: new FormControl('', Validators.required),
            lat: new FormControl('', Validators.required),
            lon: new FormControl('', Validators.required),
            countryId: new FormControl('', Validators.required)
        }, null, this.isDupeCity());

        this.loadData();
    }

    loadData(){

        this.loadCountries();

        // retrieve the ID from the 'id' parameter
        var idParam = this.activatedRoute.snapshot.paramMap.get('id');
        this.id = idParam ? +idParam : 0;

        if (this.id) {
            // EDIT MODE
            // fetch the city from the server
            var url = environment.baseUrl + 'api/Cities/' + this.id;

            this.http.get<City>(url).subscribe({
            next: (result) => {
                this.city = result;
                this.title = "Edit - " + this.city.name;

                // update the form with the city value
                this.form.patchValue(this.city);
            },
            error: (error) => console.error(error)
            });
        }
        else {
            // ADD NEW MODE
            this.title = "Create a new City";
        }
    }

    loadCountries() {
        // fetch all the countries from the server
        var url = environment.baseUrl + 'api/Countries';

        var params = new HttpParams()
            .set("pageIndex", "0")
            .set("pageSize", "9999")
            .set("sortColumn", "name");

        this.http.get<any>(url, { params }).subscribe({
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
                var url = environment.baseUrl + 'api/Cities/' + city.id;

                this.http
                  .put<City>(url, city)
                  .subscribe({
                    next: (result) => {
                      console.log("City " + city!.id + " has been updated.");

                      // go back to cities view
                      this.router.navigate(['/cities']);
                    },
                    error: (error) => console.error(error)
                  });
            }
            else {
                // ADD NEW mode
                var url = environment.baseUrl + 'api/Cities';

                this.http.post<City>(url, city)
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

            return this.http.post<boolean>(url, city).pipe(map(result => {
                return (result ? { isDupeCity: true } : null);
            }));
        };
    }
}
