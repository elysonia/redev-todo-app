import { Check } from "@mui/icons-material";
import { Button, ClickAwayListener, IconButton, List } from "@mui/material";
import { useTodoStore } from "@todoApp/providers/TodoStoreProvider/TodoStoreProvider";
import { TodoItem as TodoItemType, TodoSection } from "@todoApp/types";
import { debounce } from "lodash";
import { useCallback, useEffect, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import TodoItem from "../TodoItem";
import TodoListHeader from "../TodoListHeader";
import styles from "./todoList.module.css";

type TodoListProps = {
  section: TodoSection;
  fieldArrayName: string;
  isCurrentSection: boolean;
  onToggleEditSection: (sectionId: string) => void;
};

const TodoList = ({
  section,
  fieldArrayName,
  isCurrentSection,
  onToggleEditSection,
}: TodoListProps) => {
  const [isListCompleted, setListCompleted] = useState(false);
  const {
    removeTodoSection,
    updateTodoSection,
    removeTodoItem,
    updateTodoItem,
  } = useTodoStore((state) => state);
  const sectionId = section.id;
  const { control } = useFormContext();

  const handleUpdateTodoSection = useCallback(
    debounce((name: string) => {
      updateTodoSection({ ...section, name });
    }, 1000),
    []
  );

  const handleRemoveTodoItem = useCallback(
    debounce((id: string) => {
      removeTodoItem(sectionId, id);
    }, 500),
    [sectionId]
  );

  const handleRemoveTodoSection = useCallback(
    debounce((sectionId: string) => {
      removeTodoSection(sectionId);
    }, 500),
    []
  );

  const handleUpdateTodoItem = useCallback(
    debounce((item: TodoItemType) => {
      updateTodoItem(sectionId, item);
    }, 2000),
    [sectionId]
  );

  useEffect(() => {
    /* TODO: Do this with animations(?). */
    /* Slightly delay deletion on list completion so the UI feedback doesn't feel too sudden. */
    if (isListCompleted) {
      handleRemoveTodoSection(section.id);
    }
  }, [isListCompleted, section]);

  return (
    <ClickAwayListener
      mouseEvent={isCurrentSection ? "onMouseDown" : false}
      touchEvent={isCurrentSection ? "onTouchStart" : false}
      onClickAway={() => onToggleEditSection("")}
    >
      <div role="button" onClick={() => onToggleEditSection(section.id)}>
        <Controller
          control={control}
          name={`${fieldArrayName}.name`}
          render={({ field: { value, onChange, name } }) => {
            return (
              <TodoListHeader
                fieldName={name}
                value={value}
                onChange={onChange}
                onListChecked={(event) =>
                  setListCompleted(event.target.checked)
                }
                onUpdateSection={handleUpdateTodoSection}
              />
            );
          }}
        />

        <Controller
          control={control}
          name={`${fieldArrayName}.list`}
          render={({ field: { value, name } }) => {
            return value.map((item: TodoItemType, index) => (
              <List key={item.id}>
                <Controller
                  control={control}
                  name={`${fieldArrayName}.list.${index}.text`}
                  render={({ field: { value, onChange } }) => {
                    return (
                      <TodoItem
                        fieldArrayName={name}
                        itemId={item.id}
                        value={value}
                        onChange={onChange}
                        onUpdateItem={handleUpdateTodoItem}
                        onRemoveItem={handleRemoveTodoItem}
                      />
                    );
                  }}
                />
              </List>
            ));
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
