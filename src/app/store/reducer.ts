import {  createReducer, on } from '@ngrx/store';
import * as JobActions from './actions';
import { Job } from '../models/job';


export interface JobState {
  jobLevels: string[];
  jobs: Job[];
}



const savedJobs = localStorage.getItem('jobs');
const initialJobs: Job[] = savedJobs ? JSON.parse(savedJobs) : [];

const initialState: JobState = {
  jobLevels: [],
  jobs: initialJobs,
};


export const jobReducer = createReducer(
  initialState,
  on(JobActions.loadJobLevelsSuccess, (state, { levels }) => ({
    ...state,
    jobLevels: levels,
  })),
  on(JobActions.loadJobsSuccess, (state, { jobs }) => ({
    ...state,
    jobs: jobs,
  })),
  on(JobActions.addJobSuccess, (state, { job }) => {
    const updatedJobs = [...state.jobs, job];
    localStorage.setItem('jobs', JSON.stringify(updatedJobs)); // ✅ Save to localStorage
    return { ...state, jobs: updatedJobs, status: 'Job added successfully' };
  }),

  // Update job + Save to localStorage
  on(JobActions.updateJobSuccess, (state, { job }) => {
    const updatedJobs = state.jobs.map((j) => (j.id === job.id ? job : j));
    localStorage.setItem('jobs', JSON.stringify(updatedJobs)); // ✅ Save to localStorage
    return { ...state, jobs: updatedJobs };
  }),

  // Delete job + Save to localStorage
  on(JobActions.deleteJobSuccess, (state, { id }) => {
    const updatedJobs = state.jobs.filter((job) => job.id !== id);
    localStorage.setItem('jobs', JSON.stringify(updatedJobs)); // ✅ Save to localStorage
    return { ...state, jobs: updatedJobs, status: 'Job deleted successfully' };
  })
);
