import { TodoSection } from "@todoApp/types";
import { createStore } from "zustand";
import { devtools, persist } from "zustand/middleware";

export type TodoFormState = {
  isDirty: boolean;
  focusedFieldName: string;
  sectionFieldArrayName: string;
  fields: TodoSection[];
};

export type TodoState = {
  todoSections: TodoSection[];
  todoFormState: TodoFormState;
  isHydrated: boolean;
};

export const defaultTodoFormState: TodoFormState = {
  isDirty: false,
  focusedFieldName: "",
  sectionFieldArrayName: "",
  fields: [],
};

export type TodoActions = {
  setIsHydrated: (isHydrated: boolean) => void;
  // addTodoSection: (todoSection: TodoSection) => void;
  // addTodoItem: (sectionId: string, item: TodoItem) => void;
  // removeTodoSection: (sectionId: string) => void;
  // removeTodoItem: (sectionId: string, itemId: string) => void;
  // updateTodoSection: (section: TodoSection) => void;
  // updateTodoItem: (sectionId: string, item: TodoItem) => void;
  updateTodoSections: (sections: TodoSection[]) => void;
  updateTodoFormState: (newTodoFormState: TodoFormState) => void;
};

export type TodoStore = TodoState & TodoActions;

const defaultState: TodoState = {
  /* Data to persist. */
  todoSections: [],
  /* Saves current form state. */
  todoFormState: defaultTodoFormState,

  isHydrated: false,
};

const createTodoStore = (initState: TodoState = defaultState) => {
  return createStore<TodoStore>()(
    devtools(
      persist(
        (set) => ({
          ...initState,
          setIsHydrated: (isHydrated: boolean) =>
            set((state: TodoStore) => {
              return {
                ...state,
                isHydrated,
              };
            }),
          // addTodoSection: (todoSection: TodoSection) =>
          //   set(
          //     (state: TodoStore) => {
          //       const sectionId = todoSection.id;

          //       return {
          //         ...state,
          //         todoSections: {
          //           ...state.todoSections,
          //           [sectionId]: todoSection,
          //         },
          //       };
          //     },
          //     undefined,
          //     "todo/addTodoSection"
          //   ),
          // addTodoItem: (sectionId: string, item: TodoItem) =>
          //   set(
          //     (state: TodoStore) => {
          //       const todoSection = state.todoSections[sectionId];
          //       const newTodoList = [...todoSection.list, item];

          //       return {
          //         ...state,
          //         todoSections: {
          //           ...state.todoSections,
          //           [sectionId]: {
          //             ...todoSection,
          //             list: newTodoList,
          //           },
          //         },
          //       };
          //     },
          //     undefined,
          //     "todo/addTodoItem"
          //   ),
          // removeTodoSection: (sectionId: string) =>
          //   set(
          //     (state: TodoStore) => {
          //       const newTodoSections = Object.fromEntries(
          //         Object.entries(state.todoSections).filter(
          //           ([key]) => key != sectionId
          //         )
          //       );

          //       return { ...state, todoSections: newTodoSections };
          //     },
          //     undefined,
          //     "todo/removeTodoSection"
          //   ),
          // removeTodoItem: (sectionId: string, itemId: string) =>
          //   set(
          //     (state: TodoStore) => {
          //       const todoSection = state.todoSections[sectionId];
          //       const newTodoList = todoSection.list.filter(
          //         ({ id }: TodoItem) => id != itemId
          //       );
          //       return {
          //         ...state,
          //         todoSections: {
          //           ...state.todoSections,
          //           [sectionId]: {
          //             ...todoSection,
          //             list: newTodoList,
          //           },
          //         },
          //       };
          //     },
          //     undefined,
          //     "todo/removeTodoItem"
          //   ),
          // updateTodoSection: (section: TodoSection) =>
          //   set(
          //     (state: TodoStore) => {
          //       const existingTodoSection = state.todoSections[section.id];

          //       return {
          //         ...state,
          //         todoSections: {
          //           ...state.todoSections,
          //           [section.id]: {
          //             ...existingTodoSection,
          //             ...section,
          //           },
          //         },
          //       };
          //     },
          //     undefined,
          //     "todo/updateTodoSection"
          //   ),
          // updateTodoItem: (sectionId: string, item: TodoItem) =>
          //   set(
          //     (state: TodoStore) => {
          //       const existingTodoSection = state.todoSections[sectionId] || [];
          //       const newTodoList = existingTodoSection.list.map(
          //         (existingItem: TodoItem) => {
          //           if (existingItem.id === item.id) {
          //             return {
          //               ...existingItem,
          //               ...item,
          //             };
          //           }

          //           return existingItem;
          //         }
          //       );

          //       return {
          //         ...state,
          //         todoSections: {
          //           ...state.todoSections,
          //           [sectionId]: {
          //             ...existingTodoSection,
          //             list: newTodoList,
          //           },
          //         },
          //       };
          //     },
          //     undefined,
          //     "todo/updateTodoItem"
          //   ),
          updateTodoSections: (sections: TodoSection[]) =>
            set(
              (state: TodoStore) => {
                // const newTodoSections = Object.fromEntries(
                //   sections.map((section) => [section.id, section])
                // );

                return { ...state, todoSections: sections };
              },
              undefined,
              "todo/updateTodoSections"
            ),

          updateTodoFormState: (newTodoFormState: TodoFormState) =>
            set(
              (state: TodoStore) => {
                return { ...state, todoFormState: newTodoFormState };
              },
              undefined,
              "todo/updateTodoFormState"
            ),
        }),
        {
          name: "todoStore",
          onRehydrateStorage: (state) => {
            return () => state.setIsHydrated(true);
          },
        }
      )
    )
  );
};

export default createTodoStore;
