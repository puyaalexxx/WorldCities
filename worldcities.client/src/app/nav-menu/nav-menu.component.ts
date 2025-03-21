import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AngularMaterialSharedModule } from '../modules/angular-material-shared.module';

@Component({
  selector: 'app-nav-menu',
  standalone: true,
  imports: [RouterLink, AngularMaterialSharedModule],
  templateUrl: './nav-menu.component.html',
  styleUrl: './nav-menu.component.scss'
})
export class NavMenuComponent {

}
