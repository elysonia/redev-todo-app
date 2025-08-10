export type TodoItem = {
  id: string;
  text: string;
};

export type TodoList = TodoItem[];

export type TodoSection = {
  id: string;
  name: string;
  list: TodoList;
};
