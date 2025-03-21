import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { HomeComponent } from './app/home/home.component';
import { provideRouter, Routes } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';


export const routes: Routes = [
  { path: '', component: HomeComponent },
];

// Bootstrap the application
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),  // Use the imported routes array here
    { provide: LocationStrategy, useClass: PathLocationStrategy }, provideAnimationsAsync(), // Use HashLocationStrategy
  ],
}).catch((err) => console.error(err));

