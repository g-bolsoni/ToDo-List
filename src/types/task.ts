export interface SubTask {
  id: string;
  title: string;
  isComplete: boolean;
}

export interface Task {
  id: string;
  title: string;
  isComplete: boolean;
  subtasks?: SubTask[];
}
