"use client";

import { TodoSection } from "@todoApp/types";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTodoStore } from "../TodoStoreProvider/TodoStoreProvider";

type TodoForm = {
  todoSections: TodoSection[];
};

const TodoContext = createContext({});

const TodoProvider = ({ children }: PropsWithChildren) => {
  const { todoSections, updateTodoSections } = useTodoStore((state) => state);

  const methods = useForm<TodoForm>();
  const { reset, handleSubmit: RHFHandleSubmit } = methods;

  const todoSectionValues = useMemo(() => {
    return Object.values(todoSections);
  }, [todoSections]);

  const handleSubmit = RHFHandleSubmit(({ todoSections }) => {
    updateTodoSections(todoSections);
  });

  const todoFormValue = useMemo(() => {
    return { todoSections, onSubmit: handleSubmit };
  }, [todoSections, handleSubmit]);

  useEffect(() => {
    reset({ todoSections: todoSectionValues });
  }, [todoSectionValues]);

  return (
    <TodoContext.Provider value={todoFormValue}>
      <FormProvider {...methods}>{children}</FormProvider>
    </TodoContext.Provider>
  );
};

export const useTodo = () => useContext(TodoContext);
export default TodoProvider;
