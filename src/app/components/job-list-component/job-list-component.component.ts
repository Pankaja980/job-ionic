import { Component, OnInit, ChangeDetectorRef  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store,select } from '@ngrx/store';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
//import { TableModule } from 'primeng/table';
// import { DialogModule } from 'primeng/dialog';
// import { ToastModule } from 'primeng/toast';
// import { ChartModule } from 'primeng/chart';
// import { MessageService, ConfirmationService } from 'primeng/api';
import { Job } from '../../models/job';
import * as JobActions from '../../store/actions';
import { selectJobs ,selectJobStatusCounts} from '../../store/selector';
import{ IonicModule } from '@ionic/angular';
import { IonSearchbar, IonList, IonItem, IonLabel, IonButton, IonIcon } from '@ionic/angular';
import { JobFormComponent } from '../job-form-component/job-form-component.component';
import { AlertController } from '@ionic/angular';
// import { ButtonModule } from 'primeng/button';
// import { ConfirmDialogModule } from 'primeng/confirmdialog';
// import { DropdownModule } from 'primeng/dropdown';
// import { ConfirmDialogModule } from 'primeng/confirmdialog';
// import { ConfirmationService } from 'primeng/api';
// import { PaginatorModule ,PaginatorState} from 'primeng/paginator';
// import { ConfirmPopupModule } from 'primeng/confirmpopup';
// import { IconFieldModule } from 'primeng/iconfield';
// import { InputIconModule } from 'primeng/inputicon';
//import { selectStatusCounts } from '../state/job.selectors';
//import { PaginatorModule } from 'primeng/paginator';
import {
  FormsModule,
  FormGroup,
  FormControl,
  FormBuilder,
  
  Validators,
} from '@angular/forms';
import { JobCategorySelectorComponent } from '../job-level-selector-component/job-level-selector-component.component';
import { JobService } from 'src/app/services/job.service';
// import { ChartData } from 'chart.js';
//import { JobItemComponent } from '../job-item/job-item.component';
//import { addJob } from '../../state/job-category/actions';
//import { selectJobs } from '../../state/job-category/selector';
//import { Tooltip } from 'primeng/tooltip';
@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [
    CommonModule,
    // TableModule,
    // DialogModule,
    // ToastModule,
    // ChartModule,
    // ButtonModule,
    // ConfirmDialogModule,
    // DropdownModule,
    IonicModule,
    FormsModule,
    JobFormComponent,
    // IconFieldModule,
    // InputIconModule,
    JobCategorySelectorComponent,
    // PaginatorModule,
    // ConfirmPopupModule
  ],
 // providers: [MessageService, ConfirmationService],

  templateUrl: './job-list-component.component.html',
  styleUrls: ['./job-list-component.component.scss'],
})
export class JobListComponent implements OnInit {
  jobs$!: Observable<Job[]>;
  filteredJobs$: Observable<Job[]> = new Observable();

  selectedLevelSubject = new BehaviorSubject<string>('');
  selectedLevel$ = this.selectedLevelSubject.asObservable();
  selectedStatus: string = '';
  isEditMode: boolean = false;
  jobForm!: FormGroup;
  editingJobId: number | null = null;

  first = 0; // First page index
  rows = 10; // Default rows per page

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
  // onEdit(job: Job): void {
  //   this.isEditMode = true;
  //   this.editingJobId = job.id;
  //   this.jobForm.patchValue(job); //  Pre-fill form with job details
  //   this.displayDialog = true;
  // }
 // chartData!: ChartData<'doughnut', number[], string | string[]>;
    

//   legendData: { label: string, color: string, count: number }[] = [];

//   levelChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  //levelChartOptions: ChartOptions = { responsive: true };
  // levelChartOptions: ChartOptions<'bar'> = {
  //   responsive: true,
  //   plugins: {
  //     tooltip: {
  //       callbacks: {
  //         label: function (tooltipItem: any) {
  //           return `${tooltipItem.label}: ${tooltipItem.raw}`;
  //         }
  //       }
  //     }
  //   }
  searchText: string = '';

 
//    onPageChange(event: PaginatorState  ):void {
//     this.first = event.first ??0 ;
//     this.rows = event.rows ??10;
//   }


  constructor(
    private store: Store,
    private jobService: JobService,
    private formBuilder: FormBuilder,
    // private messageService: MessageService,
    // private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef ,//to trigger change detection and the view is updated.
   // private tooltip: Tooltip
   private alertController: AlertController
  ) {
    this.jobs$ = this.store.select(selectJobs);
    
  }


  ngOnInit(): void {
    this.store.dispatch(JobActions.loadJobs());
    this.jobs$ = this.store.select(selectJobs);
    this.jobs$.subscribe(jobs => {
      console.log('Jobs available for filtering:', jobs);
    });
   // this.jobs$.subscribe((jobs) => this.updateChart(jobs)); // Updates chart only when job list changes
   this.jobs$.subscribe(jobs => console.log('Jobs from store:', jobs));
   this.jobs$ = this.jobService.getJobs();
    this.filteredJobs$ = this.jobs$;
   // this.applyFilters();
    this.jobForm = new FormGroup({
      title: new FormControl('', Validators.required),
      company: new FormControl('', Validators.required),
      jobLevel: new FormControl('', Validators.required),
      jobStatus: new FormControl('', Validators.required),
    });
    // this.store.select(selectJobStatusCounts).subscribe(statusCounts => {
    //   if (!statusCounts) return;
    // this.store.select(selectJobs).subscribe(jobs => {
    //   console.log('Jobs from store:', jobs); // Log jobs received
    //   this.jobs = jobs; // Assign jobs to component variable
    // });
     

    //   this.chartData = {
    //     labels:Object.keys(statusCounts),
    //     datasets: [{
    //       data: Object.values(statusCounts),
    //       backgroundColor: ['Tomato', 'DodgerBlue', 'MediumSeaGreen', 'Violet', 'Gray'],
    //     }],
    //   };
      
      
      
      
    };
  
  
  
  
  onSearch(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.searchText = inputElement.value.toLowerCase();
    this.filterJobs();
    // this.filteredJobs$.subscribe(filteredJobs => {
    //   if (filteredJobs.length === 0) {
    //   this.messageService.add({
    //     severity: 'info',
    //     summary: 'No Results',
    //     detail: 'No jobs found matching your search criteria',
    //   });
    //   }
    // });
  }
  filterJobs(): void {
    //const searchWords = this.searchText.split(' ').filter(word => word);
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
  // showJobInfo(job: Job): void {
  //   this.messageService.add({
  //     severity: 'info',
  //     summary: 'Job Details',
  //     detail: `Title: ${job.name}, Company: ${job.company}, Level: ${this.getJobLevels(job)}, Status: ${job.status}`,
  //   });
  // }
  applyFilters(): void {
    this.filteredJobs$ = this.jobs$.pipe(
      // map((jobs) => {
      //   return jobs.filter(
      //     (job) =>
      //       (this.selectedLevelSubject.value
      //         ? job.levels.some(
      //             (l) => l.name === this.selectedLevelSubject.value
      //           )
      //         : true) ;
      //       (this.selectedStatus ? job.status === this.selectedStatus : true)
      //   );
      // })
      map((jobs) =>
        jobs.filter((job) => {
          const levelMatch = this.selectedLevelSubject.value
            ? job.levels && job.levels.some((l) => l.name === this.selectedLevelSubject.value)
            : true;
          const statusMatch = this.selectedStatus ? job.status === this.selectedStatus : true;
          return levelMatch && statusMatch;
        })
      )
    );
  }
  // filterJobs() {
  //   this.filteredJobs$ = this.jobs$.filter(job =>
  //     job.title.toLowerCase().includes(this.searchText.toLowerCase())
  //   );
  // }

  updateChart(jobs: Job[]): void {
    const levelCounts: { [key: string]: number } = {};

    jobs.forEach((job) => {
      job.levels.forEach((level) => {
        levelCounts[level.name] = (levelCounts[level.name] || 0) + 1;
      });
    });

    // this.levelChartData = {
    //   labels: Object.keys(levelCounts),
    //   datasets: [
    //     {
    //       label: 'Job Levels',
    //       data: Object.values(levelCounts),
    //       backgroundColor: [
    //         '#FF6384',
    //         '#36A2EB',
    //         '#FFCE56',
    //         '#4CAF50',
    //         '#9C27B0',
    //       ],
    //     },
    //   ],
    // };
    // this.levelChartOptions = {
    //   responsive: true,
     // maintainAspectRatio: false, // Allows custom height/width
      // plugins: {
      //   legend: {
      //     position: 'top',
      //     labels: {
      //       font: {
              //size: 16, // Increase font size
  //           },
  //         },
  //       },
  //     }
  // }
}

  getJobLevels(job: Job): string {
    return job.levels?.map((level) => level.name).join(', ') || 'N/A';
  }

  onLevelChange(level: string): void {
    // const target = event.target as HTMLSelectElement; // Type assertion
    // const level = target?.value ?? ''; // Provide a fallback value
    this.selectedLevelSubject.next(level);
    this.applyFilters();
  }

  // onStatusChange(job: Job, status: string): void {
  //   this.store.dispatch(JobActions.updateJob({ job: { ...job, status } }));
  //   this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Job status updated successfully' });
  // }
  //onStatusChange(job: Job, newStatus: string): void {
    //const newStatus = event.value;
    // const updatedJob = { ...job, status:newStatus }; // Create a new job object
    //const updatedJob = { ...job,  status: newStatus };
   // this.store.dispatch(JobActions.updateJob({ job: updatedJob })); // Dispatch updated job
  //   this.messageService.add({
  //     severity: 'success',
  //     summary: 'Updated',
  //     detail: `Job status updated to ${newStatus} successfully`,
  //   });
  // }

  addJob(): void {
    //this.tooltip.hide();
    this.jobForm.reset();
    this.selectedJob = null;
    this.displayDialog = true;
    this.isEditMode = false;
    this.editingJobId = null;
    // this.jobForm.reset({
    //   title: '',
    //   company: '',
    //   jobLevel: '',
    //   jobStatus: 'Applied', // Set a default value if needed
    // });
    this.cdr.detectChanges();
    

    //this.selectedJob = null;
    // this.displayDialog = true;
    // if (this.selectedJob) {
    //   const newJob = { ...this.selectedJob, status: this.selectedJob.status || 'Applied' };
    //   this.store.dispatch(addJob({ job: newJob })); // ✅ Append new job to list
    // }
    // this.displayDialog = false; // ✅ Close modal after adding
    // this.isEditMode = false;
  }

  // editJob(job: Job): void {
  //   this.selectedJob = { ...job };
  //   this.isEditMode = true;
  //   this.displayDialog = true;
  //   this.jobForm.patchValue({
  //     title: job.name,
  //     company: job.company,
  //     jobLevel: job.name,
  //     jobStatus: job.status
  //   });
  // }
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

//   confirmDelete(event: Event,job: Job): void {
//     this.confirmationService.confirm({
//       target: event.target as EventTarget,
//       message: "Are you sure you want to delete this job ?",
//       header: 'Delete Job',
//       icon: 'pi pi-exclamation-triangle', // Warning symbol
//       acceptLabel: 'Delete',
//       acceptButtonProps: {
//         label: 'Delete',
//         severity: 'danger',
//         outlined:true,
//     },
    //   rejectLabel: 'Cancel',
    //   rejectButtonProps: {
    //     label: 'Cancel',
    //     severity: 'secondary',
    //     outlined: true,
    // },
      // accept: () => {
      // this.deleteJob(job);
      // this.cdr.detectChanges();
    //   accept: () => {
    //     this.store.dispatch(JobActions.deleteJob({ id: job.id }));
    // this.messageService.add({
    //   severity: 'success',
    //   summary: 'Deleted',
    //   detail: 'Job deleted successfully',
    // });
//         //this.cdr.detectChanges();
//       },
      
//     });
//     //this.displayDialog = true;
//   }

  // deleteJob(job: Job): void {
   
      // acceptButtonStyleClass: 'p-button-danger', // Red delete button
      // rejectButtonStyleClass: 'p-button-secondary',
     
    // this.store.dispatch(JobActions.deleteJob({ id: job.id }));
    // this.messageService.add({
    //   severity: 'success',
    //   summary: 'Deleted',
    //   detail: 'Job deleted successfully',
    // });
    // this.displayDialog = true;
  //}



  onJobSave(job: Job): void {
    //   if (job.id) {
    //     this.store.dispatch(JobActions.updateJob({ job }));
    //     this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Job updated successfully' });
    //   } else {
    //     this.store.dispatch(JobActions.addJob({ job }));
    //     this.messageService.add({ severity: 'success', summary: 'Added', detail: 'Job added successfully' });
    //   }
    //   this.displayDialog = false;
    // }
    if (this.isEditMode && this.editingJobId) {
      this.store.dispatch(
        JobActions.updateJob({ job: { ...job, id: this.editingJobId } })
      );
    //   this.messageService.add({
    //     severity: 'success',
    //     summary: 'Updated',
    //     detail: 'Job updated successfully',
    //   });
    } else {
      this.store.dispatch(
        JobActions.addJob({
          job: { ...job, id: Math.floor(Math.random() * 10000) },
          
        })
      );
    //   this.messageService.add({
    //     severity: 'success',
    //     summary: 'Added',
    //     detail: 'Job added successfully',
    //   });
    }
    this.isEditMode = false; // Reset edit mode
    this.editingJobId = null;
    this.displayDialog = false;
    this.jobForm.reset({
      title: '',
      company: '',
      jobLevel: '',
      jobStatus: 'Applied', // Set a default value if needed
    });
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
    console.log(`Job with ID ${jobId} deleted.`);
  }


}
