import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { CommonModule, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { HomeComponent } from './app/home/home.component';
import { provideRouter, Routes } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { CitiesComponent } from './app/cities/cities.component';
import { CountriesComponent } from './app/countries/countries.component';
import { CityEditComponent } from './app/cities/city-edit.component';
import { CountryEditComponent } from './app/countries/country-edit.component';
import { LoginComponent } from './app/auth/login.component';
import { AuthInterceptor } from './app/auth/auth.interceptor';
import { HTTP_INTERCEPTORS, HttpClientModule, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AuthGuard } from './app/auth/auth.guard';
import { provideApollo } from 'apollo-angular';
import { inject } from '@angular/core';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';
import { environment } from './environments/environment';


export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'cities', component: CitiesComponent },
  { path: 'city/:id', component: CityEditComponent, canActivate: [AuthGuard] },
  { path: 'city', component: CityEditComponent, canActivate: [AuthGuard] },
  { path: 'countries', component: CountriesComponent },
  { path: 'country/:id', component: CountryEditComponent, canActivate: [AuthGuard] },
  { path: 'country', component: CountryEditComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent }
];

// Bootstrap the application
bootstrapApplication(AppComponent, {
    providers: [
        HttpClientModule,
        CommonModule,
        provideRouter(routes),  // Use the imported routes array here
        { provide: LocationStrategy, useClass: PathLocationStrategy }, provideAnimationsAsync(), // Use HashLocationStrategy
        provideHttpClient(
            withInterceptorsFromDi(),
        ),
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true,
        }, 
       // provideHttpClient(), 
        provideApollo(() => {
            const httpLink = inject(HttpLink);
            const uri = environment.baseUrl + 'api/graphql';

            return {
                link: httpLink.create({
                    uri: uri,
                }),
                cache: new InMemoryCache(),
            };
        }),
    ],
}).catch((err) => console.error(err));

