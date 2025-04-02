import { createAction, props } from '@ngrx/store';
import { Job } from '../models/job';

export const loadJobLevels = createAction('[Job] Load Job Levels');
export const loadJobLevelsSuccess = createAction('[Job] Load Job Levels Success', props<{ levels: string[] }>());

export const loadJobs = createAction('[Job] Load Jobs');
export const loadJobsSuccess = createAction('[Job] Load Jobs Success', props<{ jobs: Job[] }>());

export const addJob = createAction(
  '[Job] Add Job',
  props<{ job: Job }>()
);
export const addJobSuccess = createAction(
  '[Job] Add Job Success',
  props<{ job: Job }>()
);

//  Update Job
export const updateJob = createAction(
  '[Job] Update Job',
  props<{ job: Job }>()
);
export const updateJobSuccess = createAction(
  '[Job] Update Job Success',
  props<{ job: Job }>()
);

//  Delete Job
export const deleteJob = createAction(
  '[Job] Delete Job',
  props<{ id: number }>()
);
export const deleteJobSuccess = createAction(
  '[Job] Delete Job Success',
  props<{ id: number }>()
);
