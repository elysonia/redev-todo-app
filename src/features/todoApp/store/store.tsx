import { TodoItem, TodoSection, TodoSections } from "@todoApp/types";
import { createStore } from "zustand";
import { devtools } from "zustand/middleware";

export type TodoState = {
  todoSections: TodoSections;
  // editingTodoSection:
};

export type TodoActions = {
  addTodoSection: (todoSection: TodoSection) => void;
  addTodoItem: (sectionId: string, item: TodoItem) => void;
  removeTodoSection: (sectionId: string) => void;
  removeTodoItem: (sectionId: string, itemId: string) => void;
  updateTodoSection: (section: TodoSection) => void;
  updateTodoItem: (sectionId: string, item: TodoItem) => void;
  updateTodoSections: (sections: TodoSection[]) => void;
};

export type TodoStore = TodoState & TodoActions;

const defaultState: TodoState = {
  todoSections: {},
};

const createTodoStore = (initState: TodoState = defaultState) => {
  return createStore<TodoStore>()(
    devtools((set) => ({
      ...initState,
      addTodoSection: (todoSection: TodoSection) =>
        set(
          (state: TodoStore) => {
            const sectionId = todoSection.id;

            return {
              todoSections: {
                ...state.todoSections,
                [sectionId]: todoSection,
              },
            };
          },
          undefined,
          "todo/addTodoSection"
        ),
      addTodoItem: (sectionId: string, item: TodoItem) =>
        set(
          (state: TodoStore) => {
            const todoSection = state.todoSections[sectionId];
            const newTodoList = [...todoSection.list, item];

            return {
              todoSections: {
                ...state.todoSections,
                [sectionId]: {
                  ...todoSection,
                  list: newTodoList,
                },
              },
            };
          },
          undefined,
          "todo/addTodoItem"
        ),
      removeTodoSection: (sectionId: string) =>
        set(
          (state: TodoStore) => {
            const newTodoSections = Object.fromEntries(
              Object.entries(state.todoSections).filter(
                ([key]) => key != sectionId
              )
            );

            return { todoSections: newTodoSections };
          },
          undefined,
          "todo/removeTodoSection"
        ),
      removeTodoItem: (sectionId: string, itemId: string) =>
        set(
          (state: TodoStore) => {
            const todoSection = state.todoSections[sectionId];
            const newTodoList = todoSection.list.filter(
              ({ id }: TodoItem) => id != itemId
            );
            return {
              todoSections: {
                ...state.todoSections,
                [sectionId]: {
                  ...todoSection,
                  list: newTodoList,
                },
              },
            };
          },
          undefined,
          "todo/removeTodoItem"
        ),
      updateTodoSection: (section: TodoSection) =>
        set(
          (state: TodoStore) => {
            const existingTodoSection = state.todoSections[section.id];

            return {
              todoSections: {
                ...state.todoSections,
                [section.id]: {
                  ...existingTodoSection,
                  ...section,
                },
              },
            };
          },
          undefined,
          "todo/updateTodoSection"
        ),
      updateTodoItem: (sectionId: string, item: TodoItem) =>
        set(
          (state: TodoStore) => {
            const existingTodoSection = state.todoSections[sectionId] || [];
            const newTodoList = existingTodoSection.list.map(
              (existingItem: TodoItem) => {
                if (existingItem.id === item.id) {
                  return {
                    ...existingItem,
                    ...item,
                  };
                }

                return existingItem;
              }
            );

            return {
              todoSections: {
                ...state.todoSections,
                [sectionId]: {
                  ...existingTodoSection,
                  list: newTodoList,
                },
              },
            };
          },
          undefined,
          "todo/updateTodoItem"
        ),
      updateTodoSections: (sections: TodoSection[]) =>
        set(
          (state: TodoStore) => {
            const newTodoSections = Object.fromEntries(
              sections.map((section) => [section.id, section])
            );

            return { todoSections: newTodoSections };
          },
          undefined,
          "todo/updateTodoSections"
        ),
    }))
  );
};

export default createTodoStore;
