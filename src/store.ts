import { TodoSection } from "types";
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

          updateTodoSections: (sections: TodoSection[]) =>
            set(
              (state: TodoStore) => {
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
