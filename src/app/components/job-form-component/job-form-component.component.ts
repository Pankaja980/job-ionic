
import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { Job } from '../../models/job';
import {IonicModule} from '@ionic/angular';
// import { DropdownModule } from 'primeng/dropdown';
// import { CommonModule } from '@angular/common';
// import { ButtonModule } from 'primeng/button';
// import { DialogModule } from 'primeng/dialog';
// import { InputTextModule } from 'primeng/inputtext';
// import { IftaLabelModule } from 'primeng/iftalabel';

@Component({
  selector: 'app-job-form-component',
  templateUrl: './job-form-component.component.html',
  styleUrls: ['./job-form-component.component.scss'],
  standalone: true, // ✅ Standalone component mode
  imports: [
   // DropdownModule,
    FormsModule,
    CommonModule,
    // ButtonModule,
    // DialogModule,
    ReactiveFormsModule,
    IonicModule,
    // InputTextModule,
    // IftaLabelModule
  ], // Ensure proper module imports
})
export class JobFormComponent implements OnInit {
  @Input() job: Job | null = null;
  @Input() displayDialog: boolean = false; 
 // @Input() jobLevels: string[] = []; // 🔹 Job levels passed as input
  @Output() saveJob = new EventEmitter<Job>();
  @Output() cancel = new EventEmitter<void>();

 // displayDialog: boolean = false;
  jobForm!: FormGroup;
  levelOptions: { label: string; value: string }[] = []; // 🔹 Pre-processed dropdown options
  statusOptions: { label: string; value: string }[] = []; // 🔹 Pre-processed status options
  // selectedJobLevel: string = '';
  // selectedJobStatus: string = '';
  jobLevels = ['Internship','Entry Level', 'Mid Level', 'Senior Level'];
  jobStatuses: string[] = [
    'Applied',
    'Interview Scheduled',
    'Offer Received',
    'Rejected',
  ];
  // openDialog() {
  //   this.displayDialog = true;
  // }

  // //  Function to close the dialog
  // closeDialog() {
  //   this.displayDialog = false;
  // }
  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    
    this.initializeForm();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    // if (changes['job'] && this.job) {
    //   this.initializeForm(); // Reinitialize form when input changes
    // }
    if (changes['job'] && this.jobForm) {
      const updatedJob = changes['job'].currentValue as Job;

      if (updatedJob) {
        this.jobForm.patchValue({
          title: updatedJob.name ||'',
          company: updatedJob.company.name || '',
          level: updatedJob.levels[0]?.name || '',
          status: updatedJob.status || 'Applied',
        });
      } else {
        this.jobForm.reset({
          title: '',
          company: '',
          level: '',
          status: 'Applied',
        });
      }
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey() {
    this.onCancel();
  }
  initializeForm(): void {
    
    this.levelOptions = this.jobLevels.map((l) => ({ label: l, value: l }));
    this.statusOptions = this.jobStatuses.map((s) => ({ label: s, value: s }));

    //  Initialize reactive form
    this.jobForm = this.fb.group({
      title: [this.job?.name || '', Validators.required],
      company: [this.job?.company?.name || '', Validators.required],
      level: [this.job?.levels?.[0]?.name || '', Validators.required],
      status: [this.job?.status || 'Applied', Validators.required],
    });
  }

  //  Populate form if job is provided
  //   if (this.job) {
  //     this.jobForm.patchValue({
  //       name: this.job.name,
  //       company: this.job.company.name,
  //       level: this.job.levels[0]?.name || '',
  //       status: this.job.status || ''
  //     });
  //   }
  // }

  onSubmit(): void {
    if (this.jobForm.valid) {
      //const formData = this.jobForm.value;
      const jobData: Job = {
        id: this.job?.id || Math.floor(Math.random() * 1000), // Assign ID if new job
        name: this.jobForm.value.title,
        company: { name: this.jobForm.value.company },
        levels: [{ name: this.jobForm.value.level }],
        status: this.jobForm.value.status,
      };
      console.log('Saving job',jobData);
      this.saveJob.emit(jobData);
      this.displayDialog = false;
    }
  }
  // saveJob() {
  //   if (this.jobForm.valid) {
  //     console.log('Saving job:', this.jobForm.value);
  //     this.dialogRef.close(this.jobForm.value);  // Close modal with data
  //   } else {
  //     console.log('Form is invalid');
  //   }
  // }

  onCancel(): void {
    this.displayDialog = false;
    this.cancel.emit();
    //this.jobForm.reset();
  }
}

