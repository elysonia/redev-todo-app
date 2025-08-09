"use client";

import { Snackbar, SnackbarProps } from "@mui/material";
import { defaultTodoFormState } from "@todoApp/store/store";
import { TodoSection, TodoSections } from "@todoApp/types";
import { useIdle } from "@uidotdev/usehooks";
import { debounce, isEmpty } from "lodash";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useShallow } from "zustand/react/shallow";
import { useTodoStore } from "../TodoStoreProvider/TodoStoreProvider";

type TodoForm = {
  todoSections: TodoSection[];
};

type TodoContextType = {
  snackbar: SnackbarProps;
  todoSections: TodoSections;
  focusedFieldName: string;
  sectionFieldArrayName: string;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  setSnackbar: (props: SnackbarProps) => void;
  setFocusedFieldName: (fieldName: string) => void;
  setSectionFieldArrayName: (sectionId: string) => void;
};

export const TodoContext = createContext<TodoContextType>({});

const TodoProvider = ({ children }: PropsWithChildren) => {
  const isIdle = useIdle(5000);
  /* Path to the current section in the form. */
  const [sectionFieldArrayName, setSectionFieldArrayName] = useState("");
  /* Path to the current field in focus in the form. */
  const [focusedFieldName, setFocusedFieldName] = useState("");
  const [snackbar, setSnackbar] = useState<SnackbarProps>({});
  const [shouldSaveOnIdle, setShouldSaveOnIdle] = useState(false);
  const [shouldRestoreStateFromStore, setShouldRestoreStateFromStore] =
    useState(true);

  const {
    todoSections,
    todoFormState,
    isHydrated,
    updateTodoSections,
    updateTodoFormState,
  } = useTodoStore(useShallow((state) => state));

  const todoFormStateRef = useRef(todoFormState);
  const methods = useForm<TodoForm>();
  const {
    reset,
    formState,
    getValues,
    handleSubmit: RHFHandleSubmit,
  } = methods;
  const isDirtyRef = useRef(formState.isDirty);
  // const todoSectionValues = useMemo(() => {
  //   return Object.values(todoSections);
  // }, [todoSections]);

  const snackbarProps = useMemo(() => {
    if (isEmpty(snackbar)) {
      return {
        open: false,
      };
    }

    return snackbar;
  }, [snackbar]);

  const handleSubmit = RHFHandleSubmit(({ todoSections }) => {
    console.log({ todoSections });
    /* Cancel all queued debounced function calls. */
    handleTodoFormState.cancel();

    updateTodoSections(todoSections);
    updateTodoFormState(defaultTodoFormState);
    setSnackbar({ open: true, message: `Tasks saved` });
  });

  const handleCloseSnackbar = useCallback(
    (event: React.SyntheticEvent | Event, reason: string) => {
      const ignoreReasonsList = ["clickaway", "escapeKeyDown"];
      if (ignoreReasonsList.includes(reason)) return;

      setSnackbar({});
    },
    [setSnackbar]
  );

  const todoValue = useMemo(() => {
    return {
      snackbar,
      todoSections,
      focusedFieldName,
      sectionFieldArrayName,
      onSubmit: handleSubmit,
      setSnackbar,
      setFocusedFieldName: setFocusedFieldName,
      setSectionFieldArrayName,
    };
  }, [
    snackbar,
    todoSections,
    focusedFieldName,
    sectionFieldArrayName,
    handleSubmit,
    setSnackbar,
    setFocusedFieldName,
    setSectionFieldArrayName,
  ]);

  const handleTodoFormState = useCallback(
    debounce(() => {
      console.log("save state");
      const fields = getValues("todoSections");
      updateTodoFormState({
        isDirty: isDirtyRef.current,
        sectionFieldArrayName,
        focusedFieldName,
        fields,
      });
    }, 2000),
    [isDirtyRef, sectionFieldArrayName, focusedFieldName]
  );

  /* Updates form default values with saved data */
  useEffect(() => {
    reset({ todoSections });
  }, [todoSections]);

  /* Saves draft to the store. */
  useEffect(() => {
    if (isDirtyRef.current) {
      handleTodoFormState();
    }
  }, [
    isDirtyRef,
    sectionFieldArrayName,
    focusedFieldName,
    handleTodoFormState,
  ]);

  /* Saves the form data after 5 seconds of inactivity. */
  useEffect(() => {
    if (isIdle && shouldSaveOnIdle) {
      /* Prevent endless API call */
      handleSubmit();
      setShouldSaveOnIdle(false);
    } else {
      setShouldSaveOnIdle(formState.isDirty);
    }
  }, [isIdle, shouldSaveOnIdle, formState, handleSubmit, setShouldSaveOnIdle]);

  /* TODO: Revise if errors from here: https://zustand.docs.pmnd.rs/integrations/persisting-store-data#usage-in-next.js occur */
  /* If the form somehow did not save before exiting, return to the state it was and save it. */
  useEffect(() => {
    if (!isHydrated) return;
    if (!shouldRestoreStateFromStore) return;
    if (!todoFormState.isDirty) {
      setShouldRestoreStateFromStore(false);
      return;
    }

    if (shouldRestoreStateFromStore && todoFormState.isDirty) {
      setFocusedFieldName(todoFormState.focusedFieldName);
      setSectionFieldArrayName(todoFormState.sectionFieldArrayName);
      reset({ todoSections: todoFormState.fields });
      handleSubmit();
      setShouldRestoreStateFromStore(false);
    }
  }, [
    isHydrated,
    shouldRestoreStateFromStore,
    todoFormState,
    setFocusedFieldName,
    setSectionFieldArrayName,
    setShouldRestoreStateFromStore,
    handleSubmit,
  ]);

  return (
    <TodoContext.Provider value={todoValue}>
      <FormProvider {...methods}>{children}</FormProvider>
      <Snackbar
        autoHideDuration={2000}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        onClose={handleCloseSnackbar}
        {...snackbarProps}
      />
    </TodoContext.Provider>
  );
};

export const useTodoContext = () => {
  const context = useContext(TodoContext);

  if (!context) {
    throw new Error("useTodoContext must be used within a TodoProvider");
  }

  return context;
};

export default TodoProvider;
