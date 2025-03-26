import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormGroup, FormBuilder, Validators, AbstractControl, AsyncValidatorFn, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from './../../environments/environment';
import { Country } from './country';
import { CommonModule } from '@angular/common';
import { AngularMaterialSharedModule } from '../modules/angular-material-shared.module';

@Component({
  selector: 'app-country-edit',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule, HttpClientModule, AngularMaterialSharedModule, RouterModule],
  templateUrl: './country-edit.component.html',
  styleUrls: ['./country-edit.component.scss']
})
export class CountryEditComponent implements OnInit {
    // the view title
    title?: string;

    // the form model
    form!: FormGroup;

    // the country object to edit or create
    country?: Country;

    // the country object id, as fetched from the active route: // It's NULL when we're adding a new country,
    // and not NULL when we're editing an existing one.
    id?: number;

    // the countries array for the select
    countries?: Country[];

    constructor(
        private fb: FormBuilder,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private http: HttpClient) {
    }

    ngOnInit() {
        this.form = this.fb.group({
            name: ['',
                Validators.required,
                this.isDupeField("name")
            ],
            iso2: ['',
                [
                Validators.required,
                Validators.pattern(/^[a-zA-Z]{2}$/)
            ],
                this.isDupeField("iso2")
            ],
            iso3: ['', [
                Validators.required,
                Validators.pattern(/^[a-zA-Z]{3}$/)
                ],
                this.isDupeField("iso3")
            ]
        });

        this.loadData();
    }

    loadData() {
        // retrieve the ID from the 'id' parameter
        var idParam = this.activatedRoute.snapshot.paramMap.get('id');
        this.id = idParam ? +idParam : 0;

        if (this.id) {
            // EDIT MODE
            // fetch the country from the server
            var url = environment.baseUrl + "api/Countries/" + this.id;
            
            this.http.get<Country>(url).subscribe({
                next: (result) => {
                this.country = result;
                this.title = "Edit - " + this.country.name;
                // update the form with the country value
                this.form.patchValue(this.country);
                },
                error: (error) => console.error(error)
            });
        }
        else {
            // ADD NEW MODE
            this.title = "Create a new Country";
        }
    }

    onSubmit() {
        var country = (this.id) ? this.country : <Country>{};

        if (country) {

            country.name = this.form.controls['name'].value;
            country.iso2 = this.form.controls['iso2'].value;
            country.iso3 = this.form.controls['iso3'].value;

            // EDIT mode
            if (this.id) { 
            
                var url = environment.baseUrl + 'api/Countries/' + country.id;

                this.http
                    .put<Country>(url, country)
                    .subscribe({
                        next: (result) => {
                            console.log("Country " + country!.id + " has been updated.");
                            // go back to countries view
                            this.router.navigate(['/countries']);
                        },
                        error: (error) => console.error(error)
                    });
            }
            else {
                // ADD NEW mode
                var url = environment.baseUrl + 'api/Countries';

                this.http
                .post<Country>(url, country)
                .subscribe({
                    next: (result) => {
                        console.log("Country " + result.id + " has been created.");
                        // go back to countries view
                        this.router.navigate(['/countries']);
                    },
                    error: (error) => console.error(error)
                });
            }
        }
    }

    isDupeField(fieldName: string): AsyncValidatorFn {

        return (control: AbstractControl): Observable<{[key: string]: any} | null> => {
            var params = new HttpParams()
                .set("countryId", (this.id) ? this.id.toString() : "0")
                .set("fieldName", fieldName)
                .set("fieldValue", control.value);

            var url = environment.baseUrl + 'api/Countries/IsDupeField';

            return this.http.post<boolean>(url, null, { params })
            .pipe(map(result => {
                return (result ? { isDupeField: true } : null);
            })); 
        }
    }
}