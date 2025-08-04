import { TodoItem, TodoList, TodoSections } from "@todoApp/types";
import { create } from "zustand";

interface TodoState {
  todoSections: TodoSections;
}

interface StateFn {
  [key: string]: ReturnType<() => {}>;
}

const addTodoSection =
  (sectionName: string, list: TodoList) => (state: TodoState) => ({
    todoSections: {
      ...state.todoSections,
      [sectionName]: list,
    },
  });

const addTodoItem =
  (sectionName: string, item: TodoItem) => (state: TodoState) => {
    const todoSection = state.todoSections[sectionName];
    const newTodoSection = [...todoSection, item];
    return {
      todoSections: {
        ...state.todoSections,
        [sectionName]: newTodoSection,
      },
    };
  };

const removeTodoSection = (sectionName: string) => (state: TodoState) => {
  const newTodoSections = Object.fromEntries(
    Object.entries(state.todoSections).filter(([key]) => key != sectionName)
  );
  return { todoSections: newTodoSections };
};

const removeTodoItem =
  (sectionName: string, item: TodoItem) => (state: TodoState) => {
    const todoSection = state.todoSections[sectionName];
    const newTodoSection = todoSection.filter(
      ({ id }: TodoItem) => id != item.id
    );
    return {
      ...state.todoSections,
      [sectionName]: newTodoSection,
    };
  };

const useTodoStore = create<TodoState & StateFn>((set) => ({
  todoSections: {
    todo1: [
      { id: 1, text: "live life love" },
      { id: 2, text: "live life love2" },
    ],
    todo2: [
      { id: 1, text: "live life love" },
      { id: 2, text: "live life love2" },
    ],
    todo3: [
      { id: 1, text: "live life love" },
      { id: 2, text: "live life love2" },
    ],
    todo4: [
      { id: 1, text: "live life love" },
      { id: 2, text: "live life love2" },
    ],
  },
  addTodoSection: (sectionName: string, list: TodoList) =>
    set(addTodoSection(sectionName, list)),
  addTodoItem: (sectionName: string, item: TodoItem) =>
    set(addTodoItem(sectionName, item)),
  removeTodoSection: (sectionName: string) =>
    set(removeTodoSection(sectionName)),
  removeTodoItem: (sectionName: string, item: TodoItem) =>
    set(removeTodoItem(sectionName, item)),
}));

export const todoSectionsSelector = () =>
  useTodoStore((state: TodoState) => state.todoSections);

export default useTodoStore;
