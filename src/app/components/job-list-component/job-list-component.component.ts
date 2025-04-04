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
//import { ChartModule } from 'primeng/chart';
import {
  FormsModule,
  FormGroup,
  FormControl,
  FormBuilder,
  
  Validators,
} from '@angular/forms';
import { JobCategorySelectorComponent } from '../job-level-selector-component/job-level-selector-component.component';
import { Chart, ChartData , ChartConfiguration, ChartType} from 'chart.js/auto';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    JobFormComponent,
    JobCategorySelectorComponent,
  ],
 // providers: [MessageService, ConfirmationService],

  templateUrl: './job-list-component.component.html',
  styleUrls: ['./job-list-component.component.scss'],
})

export class JobListComponent implements OnInit, AfterViewInit {
  @ViewChild('barChartCanvas', { static: false }) barChartCanvas!: ElementRef;
  @ViewChild('doughnutChartCanvas') doughnutChartCanvas!: ElementRef;
  jobs$!: Observable<Job[]>;
  filteredJobs$: Observable<Job[]> = new Observable();

  selectedLevelSubject = new BehaviorSubject<string>('');
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

  // chartData!: ChartData<'doughnut', number[], string | string[]>;
    

  // legendData: { label: string, color: string, count: number }[] = [];

  // levelChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  searchText: string = '';

  constructor(
    private store: Store,
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef ,
   private alertController: AlertController
  ) {
    this.jobs$ = this.store.select(selectJobs);
    
  }
  

  ngOnInit(): void {
    this.store.dispatch(JobActions.loadJobs());
   // this.jobs$.subscribe((jobs) => this.updateChart(jobs));
    this.filteredJobs$ = this.jobs$;
    this.applyFilters();
    this.jobForm = new FormGroup({
      title: new FormControl('', Validators.required),
      company: new FormControl('', Validators.required),
      jobLevel: new FormControl('', Validators.required),
      jobStatus: new FormControl('', Validators.required),
    }); 

    this.store.select(selectJobStatusCounts).subscribe(statusCounts => {
      if (!statusCounts) return;
      this.updateDoughnutChart(statusCounts);
    });
    }
    ngAfterViewInit(): void {
      this.createBarChart();
      this.createDoughnutChart();

      this.jobs$.subscribe((jobs) => {
        this.updateChart(jobs);
      });
    }
    createBarChart(): void {
      this.barChart = new Chart(this.barChartCanvas.nativeElement, {
        type: 'bar' as ChartType,
        data: {
          labels: [],
          datasets: [{ label: 'Job Levels', data: [], backgroundColor: ['#3498db', '#f39c12', '#2ecc71'] }],
        },
        options: { responsive: true, maintainAspectRatio: false },
      });
      console.log('Initial Chart Data:', this.barChart.data);
    }
    createDoughnutChart(): void {
      this.doughnutChart = new Chart(this.doughnutChartCanvas.nativeElement, {
        type: 'doughnut' as ChartType,
        data: {
          labels: [],
          datasets: [{ data: [], backgroundColor: ['#3498db', '#f39c12', '#e74c3c', '#2ecc71'] }],
        },
        options: { responsive: true, maintainAspectRatio: false },
      });
    }
//     updateChart(jobs: Job[]): void {
//       if (!jobs || jobs.length === 0) return; 
//       const levelCounts: { [key: string]: number } = {};
//       jobs.forEach((job) => {
//         job.levels.forEach((level) => {
//           levelCounts[level.name] = (levelCounts[level.name] || 0) + 1;
//         });
//       });
//       console.log('Job level counts:', levelCounts);
//       const labels = Object.keys(levelCounts);
//       const data = Object.values(levelCounts);
      
// console.log('Final Labels:', labels);  // Should NOT be empty
// console.log('Final Data:', data);   
//       if (this.barChart && labels.length > 0 && data.length > 0) {
//         this.barChart.destroy();
//         this.barChart.data.labels = labels;
//         this.barChart.data.datasets[0].data = data;
//         this.barChart.update();
//       }
//     }
    updateDoughnutChart(statusCounts: { [key: string]: number }): void {
      if (this.doughnutChart) {
        this.doughnutChart.data.labels = Object.keys(statusCounts);
        this.doughnutChart.data.datasets[0].data = Object.values(statusCounts);
        this.doughnutChart.update();
      }
      else {
        console.warn('Bar chart data is empty.');
      }
    }
    displayLimit = 10; // Initially show only 10 jobs

increaseLimit() {
  this.displayLimit += 10; // Load 10 more jobs when clicked
}
  onSearch(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.searchText = inputElement.value.toLowerCase();
    this.filterJobs();
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
 

//   updateChart(jobs: Job[]): void {
//     const levelCounts: { [key: string]: number } = {};

//     jobs.forEach((job) => {
//       job.levels.forEach((level) => {
//         levelCounts[level.name] = (levelCounts[level.name] || 0) + 1;
//       });
//     });
//     this.levelChartData = {
//       labels: Object.keys(levelCounts),
//       datasets: [
//         {
//           label: 'Job Levels',
//           data: Object.values(levelCounts),
//           backgroundColor: [
//             '#FF6384',
//             '#36A2EB',
//             '#FFCE56',
//             '#4CAF50',
//             '#9C27B0',
//           ],
//         },
//       ],
//     };
// }
updateChart(jobs: Job[]): void {
  if (!jobs || jobs.length === 0) return;

  const levelCounts: { [key: string]: number } = {};
  jobs.forEach((job) => {
    job.levels.forEach((level) => {
      levelCounts[level.name] = (levelCounts[level.name] || 0) + 1;
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


  getJobLevels(job: Job): string {
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

  private getExistingJobs(): Job[] {
    return JSON.parse(localStorage.getItem('jobs') || '[]');
  }
  
  private getUpdatedJobsList(updatedJob: Job): Job[] {
    return this.getExistingJobs().map(job =>
      job.id === updatedJob.id ? updatedJob : job
    );
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
