import { TodoSection } from "types";
import { createStore } from "zustand";
import { devtools, persist } from "zustand/middleware";

export type TodoDraft = {
  isDirty: boolean;
  focusedFieldName: string;
  sectionFieldArrayName: string;
  values: TodoSection[];
};

export type TodoState = {
  todoSections: TodoSection[];
  todoDraft: TodoDraft;
  isHydrated: boolean;
};

export const defaultTodoDraft: TodoDraft = {
  isDirty: false,
  focusedFieldName: "",
  sectionFieldArrayName: "",
  values: [],
};

export type TodoActions = {
  setIsHydrated: (isHydrated: boolean) => void;
  updateTodoSections: (sections: TodoSection[]) => void;
  updateTodoDraft: (newTodoFormState: TodoDraft) => void;
};

export type TodoStore = TodoState & TodoActions;

const defaultState: TodoState = {
  /* Data to persist. */
  todoSections: [],
  /* Saves current form state. */
  todoDraft: defaultTodoDraft,

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

          updateTodoSections: (data: TodoSection[]) =>
            set(
              (state: TodoStore) => {
                return { ...state, todoSections: data };
              },
              undefined,
              "todo/updateTodoSections"
            ),

          updateTodoDraft: (newTodoDraft: TodoDraft) =>
            set(
              (state: TodoStore) => {
                return { ...state, todoDraft: newTodoDraft };
              },
              undefined,
              "todo/updateTodoDraft"
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
