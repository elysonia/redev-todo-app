"use client";

import { useTodoStore } from "@todoApp/providers/TodoStoreProvider/TodoStoreProvider";
import { TodoSection } from "@todoApp/types";
import { useEffect, useMemo, useState } from "react";
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
} from "react-hook-form";
import AddTodo from "../AddTodo";
import TodoList from "../TodoList";
import styles from "./todoSections.module.css";

type TodoForm = {
  todoSections: TodoSection[];
};

const TodoSections = () => {
  const [currentSectionId, setCurrentSectionId] = useState("");
  const { todoSections } = useTodoStore((state) => state);

  const methods = useForm<TodoForm>();
  const { control, reset } = methods;

  /* Using field arrays because I want to implement ordering todo sections */
  const { fields } = useFieldArray({ control, name: "todoSections" });

  const todoSectionValues = useMemo(() => {
    return Object.values(todoSections);
  }, [todoSections]);

  const handleToggleEditSection = (sectionId: string) => {
    setCurrentSectionId(sectionId);
  };

  useEffect(() => {
    reset({ todoSections: todoSectionValues });
  }, [todoSectionValues]);

  /* TODO: Add react-window */
  return (
    <FormProvider {...methods}>
      <AddTodo />
      <div className={styles.todosContainer}>
        {fields.map((section, index) => (
          <Controller
            key={`${section.id}.${index}`}
            name={`todoSections.${index}`}
            control={control}
            render={({ field: { value, name } }) => {
              return (
                <TodoList
                  section={value}
                  fieldArrayName={name}
                  isCurrentSection={currentSectionId === section.id}
                  onToggleEditSection={handleToggleEditSection}
                />
              );
            }}
          />
        ))}
      </div>
    </FormProvider>
  );
};

export default TodoSections;
