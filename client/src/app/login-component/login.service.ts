import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '../models/login.model';

const httpOptions = {
  headers: new HttpHeaders({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, PUT",
    "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, Authorization",
    'Cache-Control':  'no-cache, no-store, must-revalidate, post-check=0, pre-check=0',
        'Pragma': 'no-cache',
        'Expires': '0'
  })
};

@Injectable({
  providedIn: 'root'
})
export class LoginService {

	constructor(private http: HttpClient){

	}

	validateLogin(user: User){
		return this.http.post('/api/user/signin',{
			username : user.username,
			password : user.password
		}, httpOptions)
  }

  getUser(){ return JSON.parse(localStorage.getItem("user")) }

  validateLogout(){
    return this.http.get('/api/logout');
  }

  setToken(token){
    localStorage.setItem("token", token);
  }

  getToken(){ return localStorage.getItem("token") }
  deleteToken(){ return localStorage.removeItem("token") }

  getUserPayload() {
    var token = this.getToken();
    if (token) {
      var userPayload = atob(token.split('.')[1]);
      return JSON.parse(userPayload);
    }
    else
      return null;
  }

  isLoggedIn() {
    var userPayload = this.getUserPayload();
    if (userPayload)
      return true
    else
      return false;
  }

}
