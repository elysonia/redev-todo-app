export interface TodoItem {
  id: number;
  text: string;
}

export type TodoList = TodoItem[];

export interface TodoSections {
  [key: string]: TodoItem[];
}
