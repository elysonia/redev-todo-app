import { Button, IconButton, List } from "@mui/material";
import { TodoItem as TodoItemType, TodoSection } from "@todoApp/types";
import TodoItem from "../TodoItem";

import { Check } from "@mui/icons-material";
import { ClickAwayListener } from "@mui/material";
import { useTodoStore } from "@todoApp/providers/TodoStoreProvider/TodoStoreProvider";
import { useEffect, useState } from "react";
import TodoListHeader from "../TodoListHeader";
import styles from "./todoList.module.css";

type TodoListProps = {
  section: TodoSection;
  isCurrentSection: boolean;
  onToggleEditSection: (sectionId: string) => void;
};

const TodoList = ({
  section,
  isCurrentSection,
  onToggleEditSection,
}: TodoListProps) => {
  const [isListCompleted, setListCompleted] = useState(false);
  const removeTodoSection = useTodoStore((state) => state.removeTodoSection);

  useEffect(() => {
    /* TODO: Do this with animations. */
    /* Slightly delay deletion on list completion so the UI feedback doesn't feel too sudden. */
    let delayedRemoveTodoSection: ReturnType<typeof setTimeout>;
    if (isListCompleted) {
      delayedRemoveTodoSection = setTimeout(
        () => removeTodoSection(section.id),
        500
      );
    }

    return () => clearTimeout(delayedRemoveTodoSection);
  }, [isListCompleted]);

  return (
    <ClickAwayListener
      mouseEvent={isCurrentSection ? "onMouseDown" : false}
      touchEvent={isCurrentSection ? "onTouchStart" : false}
      onClickAway={() => onToggleEditSection("")}
    >
      <div role="button" onClick={() => onToggleEditSection(section.id)}>
        <TodoListHeader
          section={section}
          onListChecked={(event) => setListCompleted(event.target.checked)}
        />
        {isListCompleted
          ? null
          : section.list.map((item: TodoItemType) => (
              <List key={item.id}>
                <TodoItem sectionId={section.id} item={item} />
              </List>
            ))}
        {isCurrentSection && (
          <div className={styles.listFooterContainer}>
            <Button>Set reminder</Button>
            <IconButton>
              <Check />
            </IconButton>
          </div>
        )}
      </div>
    </ClickAwayListener>
  );
};

export default TodoList;
