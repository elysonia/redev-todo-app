import { Check } from "@mui/icons-material";
import { Button, ClickAwayListener, IconButton, List } from "@mui/material";
import { useTodoContext } from "@todoApp/providers/TodoProvider/TodoProvider";
import { TodoItem as TodoItemType, TodoSection } from "@todoApp/types";
import { isEmpty } from "lodash";
import { useCallback, useEffect, useState } from "react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import TodoItem from "../TodoItem";
import TodoListHeader from "../TodoListHeader";
import styles from "./todoList.module.css";

type TodoListProps = {
  index: number;
  section: TodoSection;
  parentFieldName: string;
};

const TodoList = ({ index, section, parentFieldName }: TodoListProps) => {
  const [isListCompleted, setListCompleted] = useState(false);
  const {
    sectionFieldArrayName,
    onSubmit,
    setFocusedFieldName,
    setSectionFieldArrayName,
  } = useTodoContext();
  const { control, getValues } = useFormContext();
  const { remove, update } = useFieldArray({ control, name: "todoSections" });

  const isActiveFieldArray = sectionFieldArrayName === parentFieldName;

  /* Filter out empty todo item on clicking away from the section. */
  const handleClickAway = useCallback(() => {
    const todoSections = getValues("todoSections");
    const todoSection = todoSections[index];
    const newTodoList = todoSection.list.filter((item: TodoItemType) => {
      return !isEmpty(item.text);
    });
    const newTodoSection = {
      id: todoSection.id,
      name: todoSection.name,
      list: newTodoList,
    };

    update(index, newTodoSection);
    setSectionFieldArrayName("");
    setFocusedFieldName("");
    onSubmit();
  }, [index, setSectionFieldArrayName]);

  const handleSetSectionActive = useCallback(() => {
    setSectionFieldArrayName(parentFieldName);
  }, [parentFieldName]);

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
      mouseEvent={isActiveFieldArray ? "onMouseDown" : false}
      touchEvent={isActiveFieldArray ? "onTouchStart" : false}
      onClickAway={handleClickAway}
    >
      <div>
        <TodoListHeader
          parentFieldName={parentFieldName}
          onListChecked={(event) => setListCompleted(event.target.checked)}
          onSetSectionActive={handleSetSectionActive}
        />
        <Controller
          control={control}
          name={`${parentFieldName}.list`}
          render={({ field: { value, name } }) => {
            return (
              <List>
                {value.map((item: TodoItemType, itemIndex: number) => (
                  <TodoItem
                    key={item.id}
                    itemIndex={itemIndex}
                    parentFieldName={name}
                    onSetSectionActive={handleSetSectionActive}
                  />
                ))}
              </List>
            );
          }}
        />

        {isActiveFieldArray && (
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
