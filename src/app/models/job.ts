export interface Job {
    id: number;
    name: string;
    company: {name:string};
    levels: { name: string }[];
    status: string; 
  }
  