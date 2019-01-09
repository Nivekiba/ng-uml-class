import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { LoginService } from "./login.service";
import { User } from "../models/login.model";

@Component({
  selector: 'app-login-component',
  templateUrl: './login-component.component.html',
  styleUrls: ['./login-component.component.css'],
  providers: [LoginService]
})
export class LoginComponentComponent implements OnInit {

  public user: User;
  public message: String;

  constructor(private loginservice: LoginService, private router: Router) {
    this.user = new User();
  }


  ngOnInit() {
    if(this.loginservice.isLoggedIn())
      this.router.navigateByUrl("/dashboard")
  }

  login(){
    if(this.user.username && this.user.password){
      this.loginservice.validateLogin(this.user).subscribe(
        result => {
          if(result["success"]){
            this.loginservice.setToken(result["token"])
            localStorage.setItem("user", JSON.stringify(result["user"]));
            this.router.navigateByUrl("/dashboard")
          }
        },
        err => {
          this.message = err["error"]["msg"]
        }
      )
    }
  }

}
