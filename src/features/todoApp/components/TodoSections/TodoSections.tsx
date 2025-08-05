"use client";

import { Delete } from "@mui/icons-material";
import { IconButton, ListSubheader } from "@mui/material";
import { useTodoStore } from "@todoApp/providers/TodoStoreProvider/TodoStoreProvider";
import React from "react";
import AddTodo from "../AddTodo";
import TodoList from "../TodoList";
import styles from "./todoSections.module.css";

const TodoSections = () => {
  const { todoSections, removeTodoSection } = useTodoStore((state) => state);
  const todoSectionEntries = Object.entries(todoSections);

  const handleRemoveSection = ({ sectionName = "" }) => {
    removeTodoSection(sectionName);
  };
  /* TODO: Add react-window */
  return (
    <div>
      <AddTodo />
      <div className={styles.todosContainer}>
        {todoSectionEntries.map(([sectionName, list], index) => (
          <React.Fragment key={`${sectionName}-${index}`}>
            <ListSubheader>
              {sectionName}
              <IconButton
                color="error"
                size="medium"
                onClick={() => handleRemoveSection({ sectionName })}
              >
                <Delete />
              </IconButton>
            </ListSubheader>
            <TodoList sectionName={sectionName} list={list} />
            <AddTodo sectionName={sectionName} />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default TodoSections;
