import { TodoItem, TodoSection, TodoSections } from "@todoApp/types";
import { createStore } from "zustand";

export type TodoState = {
  todoSections: TodoSections;
};

export type TodoActions = {
  addTodoSection: (todoSection: TodoSection) => void;
  addTodoItem: (sectionId: string, item: TodoItem) => void;
  removeTodoSection: (sectionId: string) => void;
  removeTodoItem: (sectionId: string, item: TodoItem) => void;
  updateTodoSection: (section: TodoSection) => void;
  updateTodoItem: (sectionId: string, item: TodoItem) => void;
};

export type TodoStore = TodoState & TodoActions;

const defaultState: TodoState = {
  todoSections: {},
};

const addTodoSection = (todoSection: TodoSection) => (state: TodoStore) => {
  const sectionId = todoSection.id;

  return {
    todoSections: {
      ...state.todoSections,
      [sectionId]: todoSection,
    },
  };
};

const addTodoItem =
  (sectionId: string, item: TodoItem) => (state: TodoStore) => {
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
  };

const removeTodoSection = (sectionId: string) => (state: TodoStore) => {
  const newTodoSections = Object.fromEntries(
    Object.entries(state.todoSections).filter(([key]) => key != sectionId)
  );

  return { todoSections: newTodoSections };
};

const removeTodoItem =
  (sectionId: string, item: TodoItem) => (state: TodoStore) => {
    const todoSection = state.todoSections[sectionId];
    const newTodoList = todoSection.list.filter(
      ({ id }: TodoItem) => id != item.id
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
  (sectionId: string, item: TodoItem) => (state: TodoStore) => {
    const existingTodoSection = state.todoSections[sectionId];
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
