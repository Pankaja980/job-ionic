// import { Component, OnInit } from '@angular/core';

// @Component({
//   selector: 'app-job-level-selector-component',
//   templateUrl: './job-level-selector-component.component.html',
//   styleUrls: ['./job-level-selector-component.component.scss'],
// })
// export class JobLevelSelectorComponentComponent  implements OnInit {

//   constructor() { }

//   ngOnInit() {}

// }
import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
//import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { Observable, BehaviorSubject, combineLatest, map,of } from 'rxjs';
import { Store } from '@ngrx/store';
import { loadJobLevels, loadJobs,  } from '../../store/actions';
import { selectJobLevels, selectJobs } from '../../store/selector';
import { Job } from '../../models/job';
//import { HttpClient } from '@angular/common/http';
//import { startWith } from 'rxjs/operators';
import {IonicModule} from '@ionic/angular'; 
@Component({
  selector: 'app-job-level-selector-component',
  templateUrl: './job-level-selector-component.component.html',
  styleUrls: ['./job-level-selector-component.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
 
})
export class JobCategorySelectorComponent implements OnInit {
  jobLevels$: Observable<{ label: string; value: string }[]> = new Observable<{ label: string; value: string }[]>();
  jobs$: Observable<Job[]> = new Observable();
  filteredJobs$: Observable<Job[]>  = new Observable();

  private selectedCategorySubject = new BehaviorSubject<string>('');
  selectedCategory$ = this.selectedCategorySubject.asObservable();

  @Input() set selectedCategory(value: string) {
    this.selectedCategorySubject.next(value);
  }

  @Output() selectedCategoryChange = new EventEmitter<string>();
  @Output() filteredJobsChange = new EventEmitter<Job[]>(); 
  @Output() levelSelected = new EventEmitter<string>();
  constructor(private store: Store) {}

  ngOnInit(): void {
    // Dispatch actions to fetch job levels and jobs
    this.store.dispatch(loadJobLevels());
    this.store.dispatch(loadJobs());

    this.jobLevels$ = this.store.select(selectJobLevels).pipe(
      map((levels: string[] |null) =>levels
      ? levels.map(level => ({ label: level, value: level})):[]
    )
    );

    this.jobs$ = this.store.select(selectJobs);

    this.filterJobs();
  }

  filterJobs(): void {
    this.filteredJobs$ = combineLatest([this.jobs$, this.selectedCategory$]).pipe(
      map(([jobs, selectedCategory]) =>
        selectedCategory ? jobs.filter(job => job.levels.some(level =>level.name === selectedCategory))
      :jobs
    )
  );
  }

  // onCategoryChange(event: Event): void {
  //   const target = event.target as HTMLSelectElement; // Explicitly cast to HTMLSelectElement
  //   const category = target?.value || '';
  //   this.selectedCategorySubject.next(category);
  //   this.selectedCategoryChange.emit(category);
  //   this.filteredJobs$.subscribe(filteredJobs => this.filteredJobsChange.emit(filteredJobs));
  // }
  onCategoryChange(level: string): void {
    // this.selectedCategorySubject.next(selectedValue);
    // this.selectedCategoryChange.emit(selectedValue);
    // this.filteredJobs$.subscribe(filteredJobs => this.filteredJobsChange.emit(filteredJobs));
    this.levelSelected.emit(level);
  }
  
  // toggleDropdown(): void {
  //   const selectElement = document.getElementById('levelSelect') as HTMLSelectElement;
  //   selectElement?.focus(); // Opens the dropdown when clicked
  // }
  
}

