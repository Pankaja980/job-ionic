import { Component, OnInit, ChangeDetectorRef, AfterViewInit, ViewChild, ElementRef  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Job } from '../../models/job';
import * as JobActions from '../../store/actions';
import { selectJobs ,selectJobStatusCounts} from '../../store/selector';
import{ IonicModule } from '@ionic/angular';
import { JobFormComponent } from '../job-form-component/job-form-component.component';
import { AlertController } from '@ionic/angular';
import{ScrollingModule} from '@angular/cdk/scrolling';//for virtual scrolling
//import { ChartModule } from 'primeng/chart';
import {
  FormsModule,
  FormGroup,
  FormControl,
  FormBuilder,
  
  Validators,
} from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { JobCategorySelectorComponent } from '../job-level-selector-component/job-level-selector-component.component';
import { Chart, ChartType} from 'chart.js/auto';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    JobFormComponent,
    JobCategorySelectorComponent,
    ScrollingModule
  ],
 // providers: [MessageService, ConfirmationService],

  templateUrl: './job-list-component.component.html',
  styleUrls: ['./job-list-component.component.scss'],
})

export class JobListComponent implements OnInit, AfterViewInit {
  @ViewChild('barChartCanvas', { static: false }) barChartCanvas!: ElementRef;// grab dom elements for chart rendering
  @ViewChild('doughnutChartCanvas') doughnutChartCanvas!: ElementRef;
  jobs$!: Observable<Job[]>;
  filteredJobs$: Observable<Job[]> = new Observable();

  selectedLevelSubject = new BehaviorSubject<string>('');//level filter
  selectedLevel$ = this.selectedLevelSubject.asObservable();
  selectedStatus: string = '';
  isEditMode: boolean = false;
  jobForm!: FormGroup;
  editingJobId: number | null = null;

  jobStatuses = [
    'Applied',
    'Interview Scheduled',
    'Rejected',
    'Offer Received',
  ];

  jobStatusOptions = this.jobStatuses.map((status) => ({
    label: status,
    value: status,
  }));

  selectedJob: Job | null = null;
  displayDialog: boolean = false;

  barChart!: Chart;
  doughnutChart!: Chart;

  
  searchText: string = '';

  constructor(
    private store: Store,
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef ,
   private alertController: AlertController
  ) {
    this.jobs$ = this.store.select(selectJobs);
    
  }
  

  ngOnInit(): void { //loads jobs from store and initializes the form
    this.store.dispatch(JobActions.loadJobs());
   // this.jobs$.subscribe((jobs) => this.updateChart(jobs));
    this.filteredJobs$ = this.jobs$;
    this.applyFilters();
    this.jobForm = new FormGroup({
      title: new FormControl('', Validators.required),
      company: new FormControl('', Validators.required),
      jobLevel: new FormControl('', Validators.required),
      jobStatus: new FormControl('Applied', Validators.required),
    }); 

   
    }
    ngAfterViewInit(): void { //create both chart after view init and updates chart when changes done
      this.createBarChart();
      this.createDoughnutChart();

      this.jobs$
      .subscribe((jobs) => {
         const updatedJobs = jobs.map((job) => ({
          ...job,
          status: job.status || 'Applied'
        }));// initialize chart with empty and updates dynamically from the store
        this.updateChart(updatedJobs);
        const statusCounts = updatedJobs.reduce((acc, job) => {
          const status = job.status;
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {} as { [key: string]: number });
  
        // Update the Doughnut Chart with these counts
        this.updateDoughnutChart(statusCounts);
      });
      // });
      // this.store.select(selectJobStatusCounts)
      // .subscribe(statusCounts => {
       // console.log('Status Counts for Doughnut Chart:', statusCounts);
      //   if (!statusCounts) return;
      //   this.updateDoughnutChart(statusCounts);
      // });
    }
    createBarChart(): void {
      this.barChart = new Chart(this.barChartCanvas.nativeElement, {
        type: 'bar' as ChartType,
        data: {
          labels: [],
          datasets: [{ label: 'Job Levels', data: [], backgroundColor: ['#3498db', '#f39c12', '#2ecc71','#b57edc'] }],
        },
        options: { responsive: true, maintainAspectRatio: false },
      });
      //console.log('Initial Chart Data:', this.barChart.data);
    }
    createDoughnutChart(): void {
      if (this.doughnutChart) return;
      this.doughnutChart = new Chart(this.doughnutChartCanvas.nativeElement, {
        type: 'doughnut' as ChartType,
        data: {
          labels: ['Applied', 'Interview Scheduled', 'Rejected', 'Offer Received'],
          datasets: [{ data: [], backgroundColor: ['#3498db', '#f39c12', '#e74c3c', '#2ecc71'] }],
        },
        options: { responsive: true, maintainAspectRatio: false },
      });
    }
    updateChart(jobs: Job[]): void {
      if (!jobs || jobs.length === 0) {
        if (this.barChart) {
          this.barChart.data.labels = [];
          this.barChart.data.datasets[0].data = [];
          this.barChart.update();
        }
        return;
      }
      const levelCounts: { [key: string]: number } = {};
      jobs.forEach((job) => {
        if (!job.levels) return;
        job.levels.forEach((level) => {
          if (level?.name) {
          levelCounts[level.name] = (levelCounts[level.name] || 0) + 1;
          }
        });
      });
    
      const labels = Object.keys(levelCounts);
      const data = Object.values(levelCounts);
    
      if (!this.barChart) {
        this.barChart = new Chart(this.barChartCanvas.nativeElement, {
          type: 'bar',
          data: {
            labels,
            datasets: [{
              label: 'Job Levels',
              data,
              backgroundColor: ['#3498db', '#f39c12', '#2ecc71', '#9b59b6'],
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
          },
        });
      } else {
        this.barChart.data.labels = labels;
        this.barChart.data.datasets[0].data = data;
        this.barChart.update();
      }
    }

    updateDoughnutChart(statusCounts: { [key: string]: number }): void {
  
    if (!this.doughnutChart || !statusCounts) {
      //console.warn('Doughnut chart not ready or status counts empty.');
      return;
    }
    const validStatuses = ['Applied', 'Interview Scheduled', 'Rejected', 'Offer Received'];
  const data = validStatuses.map(status => statusCounts[status] || 0);

  console.log('Updating Doughnut Chart with:', validStatuses, data);

  
    // const labels = Object.keys(statusCounts);
    // const data = Object.values(statusCounts);
  
    // console.log('Updating Doughnut Chart with:', labels, data);
  
    this.doughnutChart.data.labels = validStatuses;
    this.doughnutChart.data.datasets[0].data = data;
    this.doughnutChart.update();
  }
//     displayLimit = 10; // Initially show only 10 jobs

// increaseLimit() {
//   this.displayLimit += 10; // Load 10 more jobs when clicked
// }
  onSearch(event: Event): void { 
    const inputElement = event.target as HTMLInputElement;
    this.searchText = inputElement.value.toLowerCase();
    this.filterJobs();
  }
  trackByJobId(index: number, job: Job): number {
    return job.id;
  }
  filterJobs(): void {
    this.filteredJobs$ = this.jobs$.pipe(
      map((jobs) =>
      jobs.filter((job) =>
        (job.name?.toLowerCase().includes(this.searchText.toLowerCase()) || false) ||
        (job.company?.name?.toLowerCase().includes(this.searchText.toLowerCase()) || false) ||
        (job.levels?.some((level) =>
          level.name?.toLowerCase().includes(this.searchText.toLowerCase())
        ) || false) ||
        (job.status?.toLowerCase().includes(this.searchText.toLowerCase()) || false)
      )
      )
    );
  }
  
  applyFilters(): void {
    this.filteredJobs$ = this.jobs$.pipe(
      map((jobs) => {
        return jobs.filter(
          (job) =>
            (this.selectedLevelSubject.value
              ? job.levels.some(
                  (l) => l.name === this.selectedLevelSubject.value
                )
              : true) &&
            (this.selectedStatus ? job.status === this.selectedStatus : true)
        );
      })
   
     );
  }
 
  getJobLevels(job: Job): string { //converts job levels to string
    return job.levels?.map((level) => level.name).join(', ') || 'N/A';
  }

  onLevelChange(level: string): void {
    this.selectedLevelSubject.next(level);
    this.applyFilters();
  }

  addJob(): void {
    
    this.jobForm.reset();
    this.selectedJob = null;
    this.displayDialog = true;
    this.isEditMode = false;
    this.editingJobId = null;
    
    this.cdr.detectChanges();
  }


  editJob(job: Job): void {
    this.isEditMode = true;
    this.editingJobId = job.id;
    this.selectedJob = { ...job };
    this.jobForm.patchValue({
      title: job.name,
      company: job.company,
      jobLevel: job.levels[0]?.name || ' ',
      jobStatus: job.status || 'Applied',
    });
    this.displayDialog = true;
  }




  onJobSave(job: Job): void {
    if (this.isEditMode && this.editingJobId) {
      const updatedJob = { ...job, id: this.editingJobId };
  
      // Dispatch updateJob
      this.store.dispatch(JobActions.updateJob({ job: updatedJob }));
  
    } else {
      const newJob = { ...job, id: Math.floor(Math.random() * 10000) };
  
      // Dispatch addJob
      this.store.dispatch(JobActions.addJob({ job: newJob }));
  
    }
  
    // Reset edit mode and close the dialog
    this.isEditMode = false;
    this.editingJobId = null;
    this.displayDialog = false;
  
    // Reset the form
    this.jobForm.reset({
      title: '',
      company: '',
      jobLevel: '',
      jobStatus: 'Applied',
    });
  
    // Ensure UI updates instantly
    this.cdr.detectChanges();
  }
         
    
  onCancel(): void {
    this.displayDialog = false; // Close dialog
    this.jobForm.reset(); // Reset form
  }
 
  async confirmDelete(jobId: string): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: 'Are you sure you want to delete this job?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: () => {
            this.deleteJob(jobId);
          }
        }
      ]
    });

    await alert.present();
  }

  deleteJob(jobId: string): void {
    // Implement the actual delete logic here
    this.store.dispatch(JobActions.deleteJob({ id:+jobId }));
    //console.log(`Job with ID ${jobId} deleted.`);
  }


}
