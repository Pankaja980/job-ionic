import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet,IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet,IonButton],
})
export class AppComponent {
  constructor() {}
}
