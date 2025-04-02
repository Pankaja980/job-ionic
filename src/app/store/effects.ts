import { Injectable,inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import * as JobActions from './actions';
import { JobService } from '../services/job.service';
import { Job } from '../models/job';
import { Store } from '@ngrx/store';
import { tap, withLatestFrom } from 'rxjs/operators';
import { selectJobs } from './selector';

@Injectable({
  providedIn:'root',
})

export class JobEffects {
  
  private actions$= inject (Actions);
  private jobService= inject(JobService);
  private store=inject(Store);

  loadJobLevels$ = createEffect(() =>
    this.actions$.pipe(
      ofType(JobActions.loadJobLevels),
      mergeMap(() =>
        this.jobService.getJobLevels().pipe(
          map((levels) => JobActions.loadJobLevelsSuccess({ levels })),
          catchError(() => of({ type: '[Job] Load Job Levels Failed' }))
        )
      )
    )
  );

  loadJobs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(JobActions.loadJobs),
      tap(() => console.log('loadJobs action dispatched!')), 
      mergeMap(() =>
        this.jobService.getJobs().pipe(
          tap(jobs => console.log('Fetched jobs from API:', jobs)),
          map((jobs:Job[]) => JobActions.loadJobsSuccess({ jobs })),
          catchError(() => of({ type: '[Job] Load Jobs Failed' }))
        )
      )
    )
  );
  addJob$ = createEffect(() =>
    this.actions$.pipe(
      ofType(JobActions.addJob),
      mergeMap(({ job }) =>
        this.jobService.addJob(job).pipe(
          map((newJob: Job) => JobActions.addJobSuccess({ job: newJob })),
          catchError(() => of({ type: '[Job] Add Job Failed' }))
        )
      )
    )
  );

  updateJob$ = createEffect(() =>
    this.actions$.pipe(
      ofType(JobActions.updateJob),
      mergeMap(({ job }) =>
        this.jobService.updateJob(job).pipe(
          map((updatedJob: Job) => JobActions.updateJobSuccess({ job: updatedJob })),
          catchError(() => of({ type: '[Job] Update Job Failed' }))
        )
      )
    )
  );
  // showJobInfo$ = createEffect(() =>
  //   this.actions$.pipe(
  //     ofType(JobActions.showJobInfo),
  //     tap(action => {
  //       localStorage.setItem('jobInfo', JSON.stringify(action.job));
  //     })
  //   ),
  //   { dispatch: false }
  // );

  deleteJob$ = createEffect(() =>
    this.actions$.pipe(
      ofType(JobActions.deleteJob),
      mergeMap(({ id }) =>
        this.jobService.deleteJob(id).pipe(
          map(() => JobActions.deleteJobSuccess({ id })),
          catchError(() => of({ type: '[Job] Delete Job Failed' }))
        )
      )
    )
  );
  
  saveJobsToLocalStorage$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(JobActions.addJob, JobActions.updateJob, JobActions.deleteJob),
        withLatestFrom(this.store.select(selectJobs)),
        tap(([, jobs]) => {
          localStorage.setItem('jobs', JSON.stringify(jobs)); // Store updated jobs
        })
      ),
    { dispatch: false } // No further action needed
  );
}
