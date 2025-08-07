"use client";

import { TodoSection, TodoSections } from "@todoApp/types";
import {
  createContext,
  PropsWithChildren,
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
  todoSections: TodoSections;
  focusedFieldName: string;
  sectionFieldArrayName: string;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  setFocusedFieldName: (fieldName: string) => void;
  setSectionFieldArrayName: (sectionId: string) => void;
};

export const TodoContext = createContext<TodoContextType>({});

const TodoProvider = ({ children }: PropsWithChildren) => {
  const [sectionFieldArrayName, setSectionFieldArrayName] = useState("");
  const [focusedFieldName, setFocusedFieldName] = useState("");

  const { todoSections, updateTodoSections } = useTodoStore((state) => state);

  const methods = useForm<TodoForm>();
  const { reset, handleSubmit: RHFHandleSubmit } = methods;

  const todoSectionValues = useMemo(() => {
    return Object.values(todoSections);
  }, [todoSections]);

  const handleSubmit = RHFHandleSubmit(({ todoSections }) => {
    updateTodoSections(todoSections);
  });

  const todoValue = useMemo(() => {
    return {
      todoSections,
      focusedFieldName,
      sectionFieldArrayName,
      onSubmit: handleSubmit,
      setFocusedFieldName: setFocusedFieldName,
      setSectionFieldArrayName,
    };
  }, [
    todoSections,
    focusedFieldName,
    sectionFieldArrayName,
    handleSubmit,
    setFocusedFieldName,
    setSectionFieldArrayName,
  ]);

  useEffect(() => {
    reset({ todoSections: todoSectionValues });
  }, [todoSectionValues]);

  return (
    <TodoContext.Provider value={todoValue}>
      <FormProvider {...methods}>{children}</FormProvider>
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
