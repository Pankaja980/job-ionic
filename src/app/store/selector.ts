import { createSelector, createFeatureSelector } from '@ngrx/store';
import { JobState } from './reducer';
//import { Job } from '../../models/job';


export const selectJobState = createFeatureSelector<JobState>('job');

export const selectJobLevels = createSelector(
  //(state: AppState) => state.job, // Ensure 'jobs' slice exists
  selectJobState,
  (jobState: JobState) => jobState?.jobLevels ?? [] 
);

export const selectJobs = createSelector(
  selectJobState,
  (state:JobState) => state?.jobs || []
);
export const selectJobStatusCounts = createSelector(
  selectJobs,
  (jobs) => {
    if (!jobs) return {}; 
    return jobs.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
);
