"use client";

import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import AddTodo from "../AddTodo";
import TodoList from "../TodoList";
import styles from "./todoSections.module.css";

const TodoSections = () => {
  const methods = useFormContext();
  const { control } = methods;

  /* Using field arrays because I want to implement ordering todo sections */
  const { fields } = useFieldArray({ control, name: "todoSections" });

  /* TODO: Add react-window */
  return (
    <>
      <AddTodo />
      <div className={styles.todosContainer}>
        {fields.map((field, index) => {
          return (
            <Controller
              key={field.id}
              name={`todoSections.${index}`}
              control={control}
              render={({ field: { name } }) => {
                return <TodoList index={index} parentFieldName={name} />;
              }}
            />
          );
        })}
      </div>
    </>
  );
};

export default TodoSections;
