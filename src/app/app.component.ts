import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet,IonButton } from '@ionic/angular/standalone';
import { JobListComponent } from './components/job-list-component/job-list-component.component';
import {IonicModule} from '@ionic/angular';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet,JobListComponent,IonicModule],
})
export class AppComponent {
  constructor() {}
}
