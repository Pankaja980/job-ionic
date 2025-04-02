import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { JobLevelSelectorComponentComponent } from './job-level-selector-component.component';

describe('JobLevelSelectorComponentComponent', () => {
  let component: JobLevelSelectorComponentComponent;
  let fixture: ComponentFixture<JobLevelSelectorComponentComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ JobLevelSelectorComponentComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(JobLevelSelectorComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
