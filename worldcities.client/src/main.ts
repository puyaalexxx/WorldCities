import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { HomeComponent } from './app/home/home.component';
import { provideRouter, Routes } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { CitiesComponent } from './app/cities/cities.component';
import { CountriesComponent } from './app/countries/countries.component';
import { CityEditComponent } from './app/cities/city-edit.component';
import { CountryEditComponent } from './app/countries/country-edit.component';


export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'cities', component: CitiesComponent },
  { path: 'city/:id', component: CityEditComponent },
  { path: 'city', component: CityEditComponent },
  { path: 'countries', component: CountriesComponent },
  { path: 'country/:id', component: CountryEditComponent },
   { path: 'country', component: CountryEditComponent }
];

// Bootstrap the application
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),  // Use the imported routes array here
    { provide: LocationStrategy, useClass: PathLocationStrategy }, provideAnimationsAsync(), // Use HashLocationStrategy
  ],
}).catch((err) => console.error(err));

