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

/**
 * @type {string} TextInputFieldName - Type for the text input fields in the RHF form
 */
export type TextInputFieldName =
  | `todoSections.${number}.name`
  | `todoSections.${number}.list.${number}.text`;

export type ObjectInputFieldName = `todoSections.${number}.reminderDateTime`;

export type BooleanInputFieldName =
  | `todoSections.${number}.isCompleted`
  | `todoSections.${number}.list.${number}.isCompleted`;

/**
 * @typedef {Object} FocusedTextInputField - Type for the focused text input fields in the RHF form
 * @property {string} fieldName - The 'name' property for the registered text input field
 * @property {number | null} selectionStart - The cursor location in the text content
 */
export type FocusedTextInputField = {
  fieldName:
    | ""
    | TextInputFieldName
    | ObjectInputFieldName
    | BooleanInputFieldName;
  selectionStart: number | null;
};
