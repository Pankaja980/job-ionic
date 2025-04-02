import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { Job } from '../models/job';

@Injectable({
  providedIn: 'root',
})
export class JobService {
  private readonly baseUrl = 'https://www.themuse.com/api/public/jobs';
  private readonly localStorageKey = 'jobs';

  constructor(private http: HttpClient) {}

  getJobLevels(): Observable<string[]> {
    // return this.http.get<string[]>(`${this.baseUrl}/levels`);
    return this.getJobs().pipe(
      map(
        (jobs: Job[]) => [
          ...new Set(
            jobs.flatMap((job) => job.levels.map((level) => level.name))
          ),
        ] // Extract unique levels
      )
    );
  }

  getJobs(): Observable<Job[]> {
    // return this.http.get<{ results: Job[] }>(`${this.baseUrl}?page=1`).pipe(
    //   map(response => response.results) // Extract jobs from API response
    // );
    const savedJobs = localStorage.getItem(this.localStorageKey);
    if (savedJobs) {
      const jobs = savedJobs ? JSON.parse(savedJobs) : [];
      return of(jobs);
    } else {
      return this.http.get<{ results: Job[] }>(`${this.baseUrl}?page=1`).pipe(
        map((response) => {
          const jobs = response.results;
          localStorage.setItem(this.localStorageKey, JSON.stringify(jobs)); // Save fetched jobs to local storage
          return jobs;
        })
      );
    }
  }
  // getJobs(): Observable<Job[]> {
  //   const savedJobs = localStorage.getItem(this.localStorageKey);
  //   const jobs = savedJobs ? JSON.parse(savedJobs) : [];
  //   return of(jobs);
  // }

  addJob(job: Job): Observable<Job> {
    const savedJobs = localStorage.getItem(this.localStorageKey);
    const jobs = savedJobs ? JSON.parse(savedJobs) : [];
    jobs.push(job);
    localStorage.setItem(this.localStorageKey, JSON.stringify(jobs));
    return of(job);
  }
  updateJob(job: Job): Observable<Job> {
    const savedJobs = localStorage.getItem(this.localStorageKey);
    const jobs = savedJobs ? JSON.parse(savedJobs) : [];
    const updatedJobs = jobs.map((j: Job) => (j.id === job.id ? job : j));
    localStorage.setItem(this.localStorageKey, JSON.stringify(updatedJobs));
    return of(job);
  }

  deleteJob(id: number): Observable<void> {
    const savedJobs = localStorage.getItem(this.localStorageKey);
    const jobs = savedJobs ? JSON.parse(savedJobs) : [];
    const updatedJobs = jobs.filter((job: Job) => job.id !== id);
    localStorage.setItem(this.localStorageKey, JSON.stringify(updatedJobs));
    return of(undefined);
  }
}
