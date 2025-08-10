"use client";

import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import AddTodo from "../AddTodo";
import TodoList from "../TodoList";
import styles from "./todoSections.module.css";

const TodoSections = () => {
  const methods = useFormContext();
  const { control } = methods;
  const backgroundImageUrl =
    "https://images.unsplash.com/photo-1686579809662-829e8374d0a8?q=80&w=2072&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  const { fields, prepend, remove } = useFieldArray({
    control,
    name: "todoSections",
  });

  /* TODO: Add react-window */
  return (
    <div
      className={styles.todosBackground}
      style={{
        backgroundImage: `url(${backgroundImageUrl})`,
      }}
    >
      <AddTodo prependSection={prepend} removeSections={remove} />
      {fields.map((field, index) => {
        return (
          <Controller
            key={`${field.id}.${index}`}
            name={`todoSections.${index}`}
            control={control}
            render={({ field: { name } }) => {
              return (
                <TodoList
                  key={field.id}
                  sectionIndex={index}
                  sectionFieldName={name}
                />
              );
            }}
          />
        );
      })}
    </div>
  );
};

export default TodoSections;
