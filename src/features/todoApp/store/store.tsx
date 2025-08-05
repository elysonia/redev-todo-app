import { TodoItem, TodoSection, TodoSections } from "@todoApp/types";
import { createStore } from "zustand";

export type TodoState = {
  todoSections: TodoSections;
};

export type TodoActions = {
  addTodoSection: (todoSection: TodoSection) => void;
  addTodoItem: (sectionKey: string, item: TodoItem) => void;
  removeTodoSection: (sectionKey: string) => void;
  removeTodoItem: (sectionKey: string, item: TodoItem) => void;
  updateTodoSection: (section: TodoSection) => void;
  updateTodoItem: (sectionKey: string, item: TodoItem) => void;
};

export type TodoStore = TodoState & TodoActions;

const defaultState: TodoState = {
  todoSections: {},
};

const addTodoSection = (todoSection: TodoSection) => (state: TodoStore) => {
  const sectionKey = todoSection.id;

  return {
    todoSections: {
      ...state.todoSections,
      [sectionKey]: todoSection,
    },
  };
};

const addTodoItem =
  (sectionKey: string, item: TodoItem) => (state: TodoStore) => {
    const todoSection = state.todoSections[sectionKey];
    const newTodoList = [...todoSection.list, item];

    return {
      todoSections: {
        ...state.todoSections,
        [sectionKey]: {
          ...todoSection,
          list: newTodoList,
        },
      },
    };
  };

const removeTodoSection = (sectionKey: string) => (state: TodoStore) => {
  const newTodoSections = Object.fromEntries(
    Object.entries(state.todoSections).filter(([key]) => key != sectionKey)
  );

  return { todoSections: newTodoSections };
};

const removeTodoItem =
  (sectionKey: string, item: TodoItem) => (state: TodoStore) => {
    const todoSection = state.todoSections[sectionKey];
    const newTodoList = todoSection.list.filter(
      ({ id }: TodoItem) => id != item.id
    );
    return {
      todoSections: {
        ...state.todoSections,
        [sectionKey]: {
          ...todoSection,
          list: newTodoList,
        },
      },
    };
  };

const updateTodoSection = (section: TodoSection) => (state: TodoStore) => {
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
};

const updateTodoItem =
  (sectionKey: string, item: TodoItem) => (state: TodoStore) => {
    const existingTodoSection = state.todoSections[sectionKey];
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
        [sectionKey]: {
          ...existingTodoSection,
          list: newTodoList,
        },
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
