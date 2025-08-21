import { uniqueId } from "lodash";
import { TodoItem, TodoSection } from "types";
import { FocusedInputField } from "types/todo";

type ReturnDefaultValue<DefaultValueType> = () => DefaultValueType;

export const getDefaultTodoItem: ReturnDefaultValue<TodoItem> = () => {
  return {
    id: uniqueId(),
    isCompleted: false,
    text: "",
  };
};

export const getDefaultTodoSection: ReturnDefaultValue<TodoSection> = () => {
  return {
    id: uniqueId(),
    name: "",
    isCompleted: false,
    isReminderExpired: false,
    reminderDateTime: null,
    list: [],
  };
};

export const defaultFocusedInputField: FocusedInputField = {
  fieldName: "",
  selectionStart: null,
};
