import { Check } from "@mui/icons-material";
import { Button, ClickAwayListener, IconButton, List } from "@mui/material";
import { useTodoContext } from "@todoApp/providers/TodoProvider/TodoProvider";
import { TodoItem as TodoItemType, TodoSection } from "@todoApp/types";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import TodoItem from "../TodoItem";
import TodoListHeader from "../TodoListHeader";
import styles from "./todoList.module.css";

type TodoListProps = {
  index: number;
  section: TodoSection;
  fieldArrayName: string;
  isCurrentSection: boolean;
  onToggleEditSection: (sectionId: string) => void;
};

const TodoList = ({
  index,
  section,
  fieldArrayName,
  isCurrentSection,
  onToggleEditSection,
}: TodoListProps) => {
  const [isListCompleted, setListCompleted] = useState(false);
  const { onSubmit } = useTodoContext();
  const { control } = useFormContext();
  const { remove } = useFieldArray({ control, name: "todoSections" });

  useEffect(() => {
    /* TODO: Do this with animations(?). */
    /* Slightly delay deletion on list completion so the UI feedback doesn't feel too sudden. */
    if (isListCompleted) {
      remove(index);
      onSubmit();
    }
  }, [isListCompleted, index, onSubmit]);

  return (
    <ClickAwayListener
      mouseEvent={isCurrentSection ? "onMouseDown" : false}
      touchEvent={isCurrentSection ? "onTouchStart" : false}
      onClickAway={() => onToggleEditSection("")}
    >
      <div role="button" onClick={() => onToggleEditSection(section.id)}>
        <TodoListHeader
          fieldArrayName={fieldArrayName}
          onListChecked={(event) => setListCompleted(event.target.checked)}
        />
        <Controller
          control={control}
          name={`${fieldArrayName}.list`}
          render={({ field: { value, name } }) => {
            return (
              <List>
                {value.map((item: TodoItemType, itemIndex: number) => (
                  <TodoItem
                    key={item.id}
                    itemIndex={itemIndex}
                    fieldArrayName={name}
                  />
                ))}
              </List>
            );
          }}
        />

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
