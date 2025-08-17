import { Dayjs } from "dayjs";

export type TodoItem = {
  id: string;
  isCompleted: boolean;
  text: string;
};

export type TodoList = TodoItem[];

export type TodoSection = {
  id: string;
  name: string;
  isCompleted: boolean;
  isReminderExpired: boolean;
  reminderDateTime?: Dayjs | string | null;
  list: TodoList;
};

export type TodoSectionDayjs = TodoSection & {
  reminderDateTime: Dayjs;
};
