import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from "../models/login.model";
import { RegisterService } from "./register.service";

@Component({
  selector: 'app-registration-component',
  templateUrl: './registration-component.component.html',
  styleUrls: ['./registration-component.component.css']
})
export class RegistrationComponentComponent implements OnInit {

  public user: User;
  public message: String;
  public messageE: String;

  constructor(private registerservice: RegisterService, private router: Router) {
    this.user = new User();
  }

  ngOnInit() {
  }

  register(){
    console.log(this.user)
    let fullname = this.user.fname+this.user.lname;
    if(this.user.lname && this.user.sexe && this.user.username && this.user.password){
      this.registerservice.registerUser(this.user).subscribe(result => {
        if(result["success"]){
          this.message = result["msg"]
          this.messageE = ""
          this.router.navigateByUrl("/login");
        }else{
          this.messageE = result["msg"]
          this.message = ""
        }
      })
    }
  }

}
