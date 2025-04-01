import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AngularMaterialSharedModule } from '../modules/angular-material-shared.module';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-nav-menu',
  standalone: true,
  imports: [RouterLink, AngularMaterialSharedModule, CommonModule, HttpClientModule],
  templateUrl: './nav-menu.component.html',
  styleUrl: './nav-menu.component.scss'
})
export class NavMenuComponent implements OnInit, OnDestroy{

    private destroySubject = new Subject();

    isLoggedIn: boolean = false;

    constructor(private authService: AuthService,private router: Router) {
        this.authService.authStatus
            .pipe(takeUntil(this.destroySubject))
            .subscribe(result => {
                this.isLoggedIn = result;
            });
    }
    
    onLogout(): void {
        this.authService.logout();
        this.router.navigate(["/"]);
    }

    ngOnInit(): void {
        this.isLoggedIn = this.authService.isAuthenticated();
    }

    ngOnDestroy() {
        this.destroySubject.next(true);
        this.destroySubject.complete();
    }
}
