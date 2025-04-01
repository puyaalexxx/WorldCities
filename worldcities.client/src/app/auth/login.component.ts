import { Component, OnInit } from '@angular/core';
import { BaseFormComponent } from '../base-form.component';
import { LoginResult } from './login-result';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from './auth.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginRequest } from './login-request';
import { AngularMaterialSharedModule } from '../modules/angular-material-shared.module';
import { CommonModule, FormStyle } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, AngularMaterialSharedModule, RouterModule, HttpClientModule],
  providers: [AuthService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent extends BaseFormComponent implements OnInit{

    title?: string;
    loginResult?: LoginResult;

    constructor(private activateRoute: ActivatedRoute, private router: Router, private authService: AuthService){
        super();
    }

    ngOnInit(): void {
        this.form = new FormGroup({
            email: new FormControl('', Validators.required),
            password: new FormControl('', Validators.required),
        });
    }

    onSubmit() {
        var loginRequest = <LoginRequest>{};
        
        loginRequest.email = this.form.controls['email'].value;
        loginRequest.password = this.form.controls['password'].value;

        this.authService
          .login(loginRequest)
          .subscribe({
            next: (result) => {
                console.log(result);
                this.loginResult = result;
          },
          error: (error) => {
            console.log(error);

            if (error.status == 401) {
                this.loginResult = error.error;
            }
        } });
    }
}
