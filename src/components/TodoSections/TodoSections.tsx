"use client";

import { GitHub } from "@mui/icons-material";
import React, { useCallback } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { VList } from "virtua";

import Toolbar from "@components/Toolbar";
import { useTodoContext } from "@providers/TodoProvider/TodoProvider";
import { KeyboardEnum } from "enums";
import Task from "./Task";
import styles from "./todoSections.module.css";

const thisYear = new Date().getFullYear();
const sectionFocusShortcuts = [KeyboardEnum.KeyEnum.tab];

const TodoSections = () => {
  const { control } = useFormContext();
  const { vListRef, sectionFieldArrayName } = useTodoContext();
  const backgroundImageUrl =
    "https://images.unsplash.com/photo-1686579809662-829e8374d0a8?q=80&w=2072&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  const sectionFieldArrayMethods = useFieldArray({
    control,
    name: "todoSections",
  });

  const { fields } = sectionFieldArrayMethods;

  const handleListKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (sectionFieldArrayName) return;
      if (!sectionFocusShortcuts.includes(event.key as KeyboardEnum.KeyEnum)) {
        return;
      }
      const target = event.target as HTMLDivElement;
      target.scrollIntoView(true);
    },
    [sectionFieldArrayName]
  );

  return (
    <div
      className={styles.todosBackground}
      style={{
        backgroundImage: `url(${backgroundImageUrl})`,
      }}
    >
      <Toolbar sectionFieldArrayMethods={sectionFieldArrayMethods} />
      <div className={styles.sectionsContainer} onKeyDown={handleListKeyDown}>
        <VList
          ref={vListRef}
          tabIndex={-1}
          /* Inline styling to effectively override default library styling */
          style={{
            height: "100%",
            padding: "80px 14px",
          }}
        >
          {fields.map((field, index) => {
            return <Task key={field.id} index={index} field={field} />;
          })}
        </VList>
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
