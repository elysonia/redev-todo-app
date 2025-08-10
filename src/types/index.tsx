import { uniqueId } from "lodash";

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

export type TodoSections = {
  [key: string]: TodoSection;
};

export const defaultTodoSection: TodoSection = {
  id: uniqueId(),
  name: "Checklist of subtasks",
  list: [],
};
