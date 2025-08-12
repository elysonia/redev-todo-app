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
  todoHistory: TodoSection[];
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
  updateTodoDraft: (newTodoDraft: TodoDraft) => void;
  updateTodoHistory: (newTodoHistory: TodoSection[]) => void;
};

export type TodoStore = TodoState & TodoActions;

const defaultState: TodoState = {
  /* List of incomplete todos. */
  todoSections: [],
  /* Saves todo editing progress. */
  todoDraft: defaultTodoDraft,
  /* List of completed todos. */
  todoHistory: [],

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
          updateTodoHistory: (newTodoHistory: TodoSection[]) =>
            set(
              (state: TodoStore) => {
                return {
                  ...state,
                  todoHistory: newTodoHistory,
                };
              },
              undefined,
              "todo/updateTodoHistory"
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
