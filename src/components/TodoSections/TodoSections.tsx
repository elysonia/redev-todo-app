"use client";

import { GitHub } from "@mui/icons-material";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";

import AddTodo from "@components/AddTodo";
import TodoList from "@components/TodoList";
import styles from "./todoSections.module.css";

const TodoSections = () => {
  const methods = useFormContext();
  const { control } = methods;
  const backgroundImageUrl =
    "https://images.unsplash.com/photo-1686579809662-829e8374d0a8?q=80&w=2072&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  const sectionFieldArrayMethods = useFieldArray({
    control,
    name: "todoSections",
  });

  const thisYear = new Date().getFullYear();

  return (
    <div
      className={styles.todosBackground}
      style={{
        backgroundImage: `url(${backgroundImageUrl})`,
      }}
    >
      <AddTodo
        prependSection={sectionFieldArrayMethods.prepend}
        removeSections={sectionFieldArrayMethods.remove}
      />
      <div className={styles.sectionsContainer}>
        {sectionFieldArrayMethods.fields.map((field, index) => {
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
      <footer className={styles.footer}>
        <span>Re:Dev &copy; {thisYear}</span> &nbsp;&bull;&nbsp;
        <GitHub />
        <a
          href="https://github.com/elysonia/redev-todo-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
      </footer>
    </div>
  );
};

export default TodoSections;
