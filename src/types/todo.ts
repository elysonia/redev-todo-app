import { Dayjs } from "dayjs";

export type TodoItem = {
  id: string;
  isCompleted: boolean;
  text: string;
};

export type TodoList = TodoItem[];

export interface TodoSection {
  id: string;
  name: string;
  isCompleted: boolean;
  isReminderExpired: boolean;
  reminderDateTime?: Dayjs | string | null;
  list: TodoList;
}

export interface TodoSectionDayjs extends TodoSection {
  reminderDateTime: Dayjs;
}
