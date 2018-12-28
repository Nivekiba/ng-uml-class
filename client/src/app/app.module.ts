import { BrowserModule} from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule} from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { TaskService } from './services/task.service';
import { TodoService } from './services/todo.service';

@NgModule({
 declarations: [
   AppComponent
 ],
 imports: [
   BrowserModule,
   HttpModule,
   FormsModule
 ],
 providers: [TaskService, TodoService],
 bootstrap: [AppComponent]
})
export class AppModule { }
