"use client";

import { ListSubheader } from "@mui/material";
import useTodoStore from "@todoApp/store/store";
import React from "react";
import TodoList from "../TodoList";
import styles from "./todoSections.module.css";

const TodoSections = () => {
  const todoSections = useTodoStore((state) => state.todoSections);
  const todoSectionEntries = Object.entries(todoSections);

  /* TODO: Add react-window */
  return (
    <div className={styles.todosContainer}>
      {todoSectionEntries.map(([sectionName, list], index) => (
        <React.Fragment key={`${sectionName}-${index}`}>
          <ListSubheader>{sectionName}</ListSubheader>
          <TodoList sectionName={sectionName} list={list} />
        </React.Fragment>
      ))}
    </div>
  );
};

export default TodoSections;
