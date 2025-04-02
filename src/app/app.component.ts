import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet,IonButton } from '@ionic/angular/standalone';
import { JobListComponent } from './components/job-list-component/job-list-component.component';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet,JobListComponent],
})
export class AppComponent {
  constructor() {}
}
