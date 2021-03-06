import { Component } from '@angular/core';
import { Router } from "@angular/router";
import { LoginService } from './login-component/login.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(public auth: LoginService, public router: Router) {

  }
  logout() {
    this.auth.validateLogout().subscribe(res => {
      this.auth.deleteToken();
      this.router.navigate(['/login']);
    });
  }
}

