"use client";

import { Snackbar, SnackbarProps } from "@mui/material";
import { defaultTodoFormState } from "@todoApp/store/store";
import { TodoSection } from "@todoApp/types";
import { useIdle } from "@uidotdev/usehooks";
import { debounce, DebouncedFunc, isEmpty } from "lodash";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  EventType,
  FormProvider,
  FormState,
  InternalFieldName,
  useForm,
} from "react-hook-form";
import { useShallow } from "zustand/react/shallow";
import { useTodoStore } from "../TodoStoreProvider/TodoStoreProvider";

type TodoForm = {
  todoSections: TodoSection[];
};

type RHFSubscribeProps = Partial<FormState<TodoForm>> & {
  values: TodoForm;
  name?: InternalFieldName;
  type?: EventType;
};

type TodoContextType = {
  snackbar: SnackbarProps;
  todoSections: TodoSection[];
  focusedFieldName: string;
  sectionFieldArrayName: string;
  setSnackbar: (props: SnackbarProps) => void;
  setFocusedFieldName: (fieldName: string) => void;
  setSectionFieldArrayName: (sectionId: string) => void;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  onSaveDraft: DebouncedFunc<(data: RHFSubscribeProps) => void>;
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

  const methods = useForm<TodoForm>();
  const {
    reset,
    formState,
    subscribe,
    setValue,
    getValues,
    handleSubmit: RHFHandleSubmit,
  } = methods;

  const snackbarProps = useMemo(() => {
    if (isEmpty(snackbar)) {
      return {
        open: false,
      };
    }

    return snackbar;
  }, [snackbar]);

  const handleSubmit = RHFHandleSubmit(({ todoSections }) => {
    handleSaveDraft.cancel();
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

  /* Saves the draft automatically every half a second.  */
  const handleSaveDraft = useCallback(
    debounce(({ values }: RHFSubscribeProps) => {
      console.log({ values: values.todoSections });
      updateTodoFormState({
        isDirty: true,
        sectionFieldArrayName,
        focusedFieldName,
        fields: values.todoSections,
      });
    }, 500),
    [sectionFieldArrayName, focusedFieldName, updateTodoFormState, getValues]
  );

  const todoValue: TodoContextType = useMemo(() => {
    return {
      snackbar,
      todoSections,
      focusedFieldName,
      sectionFieldArrayName,
      setSnackbar,
      setFocusedFieldName: setFocusedFieldName,
      setSectionFieldArrayName,
      onSubmit: handleSubmit,
      onSaveDraft: handleSaveDraft,
    };
  }, [
    snackbar,
    todoSections,
    focusedFieldName,
    sectionFieldArrayName,
    setSnackbar,
    setFocusedFieldName,
    setSectionFieldArrayName,
    handleSubmit,
    handleSaveDraft,
  ]);

  /* Detects data change from the store and updates form default values. */
  useEffect(() => {
    reset({ todoSections });
  }, [todoSections]);

  /* Subscribe to value updates without re-rendering the entire form. */
  useEffect(() => {
    const handleSubscribe = subscribe({
      formState: {
        values: true,
      },
      callback: handleSaveDraft,
    });

    return () => handleSubscribe();
  }, [subscribe, handleSaveDraft]);

  /* Autosaves form data after 5 seconds of inactivity. */
  useEffect(() => {
    if (isIdle && shouldSaveOnIdle) {
      /* Prevent endless API call */
      setShouldSaveOnIdle(false);
      handleSubmit();
    } else {
      setShouldSaveOnIdle(formState.isDirty);
    }
  }, [isIdle, shouldSaveOnIdle, formState, handleSubmit, setShouldSaveOnIdle]);

  /* https://zustand.docs.pmnd.rs/integrations/persisting-store-data#usage-in-next.js  */
  /* If the form somehow did not save before exiting, restore the draft.*/
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
      setValue("todoSections", todoFormState.fields);
      handleSubmit();
      setShouldRestoreStateFromStore(false);
    }
  }, [
    isHydrated,
    shouldRestoreStateFromStore,
    todoFormState,
    setValue,
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
