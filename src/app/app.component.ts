import { Component } from '@angular/core';
import {ExampleComponent} from "./example/example.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [
    ExampleComponent
  ],
  standalone: true
})
export class AppComponent {}
