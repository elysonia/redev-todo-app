import { TodoItem, TodoSections } from "@todoApp/types";
import { createStore } from "zustand";

export interface TodoState {
  todoSections: TodoSections;
}

export interface TodoActions {
  addTodoSection: (sectionName: string) => void;
  addTodoItem: (sectionName: string, item: TodoItem) => void;
  removeTodoSection: (sectionName: string) => void;
  removeTodoItem: (sectionName: string, item: TodoItem) => void;
  updateTodoSection: (newSectionName: string, oldSectionName: string) => void;
  updateTodoItem: (id: number, newText: string, sectionName: string) => void;
}

export type TodoStore = TodoState & TodoActions;

const defaultState: TodoState = {
  todoSections: {},
};

const addTodoSection = (sectionName: string) => (state: TodoState) => {
  return {
    todoSections: {
      ...state.todoSections,
      [sectionName]: [],
    },
  };
};

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
      todoSections: {
        ...state.todoSections,
        [sectionName]: newTodoSection,
      },
    };
  };

const updateTodoSection =
  (newSectionName: string, oldSectionName: string) => (state: TodoStore) => {
    const newTodoSectionsEntries = Object.entries(state.todoSections).map(
      ([key, value]) => {
        if (key === oldSectionName) {
          return [newSectionName, value];
        }
        return [key, value];
      }
    );

    const newTodoSections = Object.fromEntries(newTodoSectionsEntries);

    return {
      todoSections: newTodoSections,
    };
  };

const updateTodoItem =
  (id: number, newText: string, sectionName: string) => (state: TodoStore) => {
    const section = state.todoSections[sectionName];
    const newTodoSection = section.map((item: TodoItem) => {
      if (item.id === id) {
        return {
          id,
          text: newText,
        };
      }

      return item;
    });
    return {
      todoSections: {
        ...state.todoSections,
        [sectionName]: newTodoSection,
      },
    };
  };

const createTodoStore = (initState: TodoState = defaultState) => {
  return createStore<TodoStore>()((set) => ({
    ...initState,
    addTodoSection: (...props) => set(addTodoSection(...props)),
    addTodoItem: (...props) => set(addTodoItem(...props)),
    removeTodoSection: (...props) => set(removeTodoSection(...props)),
    removeTodoItem: (...props) => set(removeTodoItem(...props)),
    updateTodoSection: (...props) => set(updateTodoSection(...props)),
    updateTodoItem: (...props) => set(updateTodoItem(...props)),
  }));
};

export default createTodoStore;
