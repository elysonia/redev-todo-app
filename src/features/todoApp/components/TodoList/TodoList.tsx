import { CheckCircle } from "@mui/icons-material";
import { Button, ClickAwayListener, IconButton, List } from "@mui/material";
import { useTodoContext } from "@todoApp/providers/TodoProvider/TodoProvider";
import { TodoItem as TodoItemType, TodoSection } from "@todoApp/types";
import { isEmpty, uniqueId } from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import TodoItem from "../TodoItem";
import TodoListHeader from "../TodoListHeader";
import styles from "./todoList.module.css";

type TodoListProps = {
  index: number;
  parentFieldName: string;
};

const TodoList = ({ index, parentFieldName }: TodoListProps) => {
  const fieldName = `todoSections.${index}.list`;
  const [isListCompleted, setListCompleted] = useState(false);
  const {
    focusedFieldName,
    sectionFieldArrayName,
    onSubmit,
    setSnackbar,
    setFocusedFieldName,
    setSectionFieldArrayName,
  } = useTodoContext();
  const { control, getValues, setValue } = useFormContext();
  const { fields, insert, remove } = useFieldArray({
    control,
    name: fieldName,
  });
  const { replace: replaceTodoSections } = useFieldArray({
    control,
    name: "todoSections",
  });

  const isActiveFieldArray = sectionFieldArrayName === parentFieldName;
  const shouldShowHeader = useMemo(() => {
    const headerFieldName = `${parentFieldName}.name`;
    const headerFieldValue = getValues(headerFieldName);

    const hasNoHeaderName = isEmpty(headerFieldValue);
    const hasNoSubtasks = fields.length === 1;

    if (hasNoSubtasks && hasNoHeaderName) return false;
    if (!isActiveFieldArray) return true;
    return true;
  }, [parentFieldName, focusedFieldName, isActiveFieldArray, fields]);

  /* Filter out empty todo item on clicking away from the section. */
  const handleClickAway = useCallback(() => {
    const todoSections = getValues("todoSections");
    const todoSection = todoSections[index];
    const todoList = todoSection.list;

    const todoSectionName = todoSection.name;
    const newTodoList = todoList.filter((item: TodoItemType) => {
      return !isEmpty(item.text);
    });

    const hasNoSubtask = newTodoList.length === 0;
    if (hasNoSubtask) {
      if (todoSectionName) {
        const newTodoSection = {
          id: todoSection.id,
          name: "",
          list: [
            {
              id: uniqueId(),
              text: todoSectionName,
            },
          ],
        };
        setValue(parentFieldName, newTodoSection);
      } else {
        const newTodoSections = todoSections.filter(
          (section: TodoSection) => section.id !== todoSection.id
        );
        replaceTodoSections(newTodoSections);
      }
    } else {
      setValue(fieldName, newTodoList);
    }

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
    <>
      <ClickAwayListener
        mouseEvent={isActiveFieldArray ? "onMouseDown" : false}
        touchEvent={isActiveFieldArray ? "onTouchStart" : false}
        onClickAway={handleClickAway}
      >
        <div onClick={handleSetSectionActive}>
          {shouldShowHeader && (
            <TodoListHeader
              isActiveFieldArray={isActiveFieldArray}
              parentFieldName={parentFieldName}
              onListChecked={(event) => setListCompleted(event.target.checked)}
              onSetSectionActive={handleSetSectionActive}
            />
          )}

          <List>
            {fields.map((item, itemIndex: number) => (
              <TodoItem
                key={item.id}
                itemIndex={itemIndex}
                insert={insert}
                remove={remove}
                parentFieldName={fieldName}
                onSetSectionActive={handleSetSectionActive}
              />
            ))}
          </List>
        </div>
      </ClickAwayListener>
      {isActiveFieldArray && (
        <div className={styles.listFooterContainer}>
          <Button>Set reminder</Button>
          <IconButton onClick={handleClickAway}>
            <CheckCircle fontSize="large" />
          </IconButton>
        </div>
      )}
    </>
  );
};

export default TodoList;
