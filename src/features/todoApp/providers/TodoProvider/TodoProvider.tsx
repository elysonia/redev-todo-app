"use client";

import { Snackbar, SnackbarProps } from "@mui/material";
import { TodoSection, TodoSections } from "@todoApp/types";
import { isEmpty } from "lodash";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { FormProvider, useForm } from "react-hook-form";
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
  /* Path to the current section in the form. */
  const [sectionFieldArrayName, setSectionFieldArrayName] = useState("");
  /* Path to the current field in focus in the form. */
  const [focusedFieldName, setFocusedFieldName] = useState("");
  const [snackbar, setSnackbar] = useState<SnackbarProps>({});

  const { todoSections, updateTodoSections } = useTodoStore((state) => state);

  const methods = useForm<TodoForm>();
  const { reset, handleSubmit: RHFHandleSubmit } = methods;

  const todoSectionValues = useMemo(() => {
    return Object.values(todoSections);
  }, [todoSections]);

  const snackbarProps = useMemo(() => {
    if (isEmpty(snackbar)) {
      return {
        open: false,
      };
    }

    return snackbar;
  }, [snackbar]);

  const handleSubmit = RHFHandleSubmit(({ todoSections }) => {
    updateTodoSections(todoSections);
  });

  const handleCloseSnackbar = useCallback(
    (event: React.SyntheticEvent | Event, reason: string) => {
      if (["clickaway", "escapeKeyDown"].includes(reason)) return;

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

  useEffect(() => {
    reset({ todoSections: todoSectionValues });
  }, [todoSectionValues]);

  return (
    <TodoContext.Provider value={todoValue}>
      <FormProvider {...methods}>{children}</FormProvider>
      <Snackbar
        autoHideDuration={2000}
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
