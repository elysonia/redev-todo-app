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

  const handleRemoveSection = ({ id }: { id: string }) => {
    removeTodoSection(id);
  };
  /* TODO: Add react-window */
  return (
    <div>
      <AddTodo />
      <div className={styles.todosContainer}>
        {todoSectionEntries.map(([sectionId, todoSection], index) => (
          <React.Fragment key={`${todoSection.name}-${index}`}>
            <ListSubheader>
              {todoSection.name}
              <IconButton
                color="error"
                size="medium"
                onClick={() => handleRemoveSection({ id: todoSection.id })}
              >
                <Delete />
              </IconButton>
            </ListSubheader>
            <TodoList sectionId={todoSection.id} list={todoSection.list} />
            <AddTodo sectionId={todoSection.id} />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default TodoSections;
