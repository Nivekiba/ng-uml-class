import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '../models/login.model';

const httpOptions = {
  headers: new HttpHeaders({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, PUT",
    "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  })
};

@Injectable({
  providedIn: 'root'
})
export class RegisterService {

	constructor(private http: HttpClient){

	}

	registerUser(user: User){
		return this.http.post('/api/user/signup',{
			username : user.username,
      password : user.password,
      name: user.fname+" "+user.lname,
      sexe: user.sexe
		}, httpOptions)
  }

}
