"use client";

import { useState } from "react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import AddTodo from "../AddTodo";
import TodoList from "../TodoList";
import styles from "./todoSections.module.css";

const TodoSections = () => {
  const [currentSectionId, setCurrentSectionId] = useState("");

  const methods = useFormContext();
  const { control } = methods;

  /* Using field arrays because I want to implement ordering todo sections */
  const { fields } = useFieldArray({ control, name: "todoSections" });

  const handleToggleEditSection = (sectionId: string) => {
    setCurrentSectionId(sectionId);
  };

  /* TODO: Add react-window */
  return (
    <>
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
    </>
  );
};

export default TodoSections;
