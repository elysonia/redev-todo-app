import { defaultFocusedInputField } from "@utils/todoUtils";
import { AlarmTypeEnum } from "enums/alarmEnum";
import { TodoSection } from "types";
import { FocusedInputField } from "types/todo";
import { createStore } from "zustand";
import { devtools, persist } from "zustand/middleware";

export type TodoDraft = {
  isDirty: boolean;
  focusedInputField: FocusedInputField;
  sectionFieldArrayName: `todoSections.${number}` | "";
  values: TodoSection[];
};

export type TodoState = {
  todoSections: TodoSection[];
  todoDraft: TodoDraft;
  todoHistory: TodoSection[];
  alarmType: AlarmTypeEnum;
  alarmVolume: number;
  isHydrated: boolean;
};

export const defaultTodoDraft: TodoDraft = {
  isDirty: false,
  focusedInputField: defaultFocusedInputField,
  sectionFieldArrayName: "",
  values: [],
};

export type TodoActions = {
  setIsHydrated: (isHydrated: boolean) => void;
  updateTodoSections: (sections: TodoSection[]) => void;
  updateTodoSection: (section: TodoSection) => void;
  updateTodoDraft: (newTodoDraft: TodoDraft) => void;
  updateTodoHistory: (newTodoHistory: TodoSection[]) => void;
  updateAlarmType: (alarmType: AlarmTypeEnum) => void;
  updateAlarmVolume: (alarmVolume: number) => void;
};

export type TodoStore = TodoState & TodoActions;

const defaultState: TodoState = {
  /* List of incomplete todos. */
  todoSections: [],
  /* Saves todo editing progress. */
  todoDraft: defaultTodoDraft,

  /* TODO: Implement history */
  /* List of completed todos. */
  todoHistory: [],
  alarmType: AlarmTypeEnum.dreamscape,
  alarmVolume: 0.5,
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

          updateTodoSection: (data: TodoSection) =>
            set(
              (state: TodoStore) => {
                const newTodoSections = state.todoSections.map((section) => {
                  if (section.id === data.id) return data;
                  return section;
                });

                return { ...state, todoSections: newTodoSections };
              },
              undefined,
              "todo/updateTodoSection"
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
          updateAlarmType: (alarmType: AlarmTypeEnum) =>
            set(
              (state: TodoStore) => {
                return {
                  ...state,
                  alarmType,
                };
              },
              undefined,
              "todo/updateAlarmType"
            ),
          updateAlarmVolume: (alarmVolume: number) =>
            set(
              (state: TodoStore) => {
                return { ...state, alarmVolume };
              },
              undefined,
              "todo/updateAlarmVolume"
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
