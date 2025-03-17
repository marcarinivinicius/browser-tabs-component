
import {  Routes } from '@angular/router';
import { ExampleComponent } from './app/example/example.component';

export const appRoutes: Routes = [
  { path: '', redirectTo: '/example', pathMatch: 'full' },
  {
    path: 'example',
    component: ExampleComponent,
  },
];
