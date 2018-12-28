import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';

@Injectable()
export class TodoService {
   constructor(private http: Http) { }

   getTodos() {
       return this.http.get(environment.api + '/todo')
           .pipe(map(res => res.json()));
   }

   createTodo(todo) {
       return this.http.post(environment.api + '/todo', todo)
           .pipe(map(res => res.json()));
   }

   deleteTodo(todo) {
       return this.http.delete(environment.api + '/todo/' + todo.id);
   }

}
