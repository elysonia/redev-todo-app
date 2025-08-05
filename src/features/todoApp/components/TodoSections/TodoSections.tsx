"use client";

import { useTodoStore } from "@todoApp/providers/TodoStoreProvider/TodoStoreProvider";
import React, { useState } from "react";
import AddTodo from "../AddTodo";
import TodoList from "../TodoList";
import styles from "./todoSections.module.css";

const TodoSections = () => {
  const [currentSectionId, setCurrentSectionId] = useState("");
  const { todoSections } = useTodoStore((state) => state);
  const todoSectionEntries = Object.entries(todoSections);

  const handleToggleEditSection = (sectionId: string) => {
    setCurrentSectionId(sectionId);
  };

  /* TODO: Add react-window */
  return (
    <div>
      <AddTodo />
      <div className={styles.todosContainer}>
        {todoSectionEntries.map(([sectionId, section], index) => (
          <React.Fragment key={`${section.id}-${index}`}>
            <TodoList
              section={section}
              isCurrentSection={currentSectionId === section.id}
              onToggleEditSection={handleToggleEditSection}
            />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default TodoSections;
