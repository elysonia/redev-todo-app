import { ClickAwayListener, List } from "@mui/material";
import { useTodoContext } from "@todoApp/providers/TodoProvider/TodoProvider";
import { TodoItem as TodoItemType, TodoSection } from "@todoApp/types";
import { isEmpty } from "lodash";
import { useCallback, useEffect, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import TodoItem from "../TodoItem";
import TodoListHeader from "../TodoListHeader";

type TodoListProps = {
  index: number;
  parentFieldName: string;
};

const TodoList = ({ index, parentFieldName }: TodoListProps) => {
  const fieldName = `todoSections.${index}.list`;
  const [isListCompleted, setListCompleted] = useState(false);
  const {
    sectionFieldArrayName,
    onSubmit,
    setFocusedFieldName,
    setSectionFieldArrayName,
  } = useTodoContext();
  const { control, getValues, setValue } = useFormContext();
  const { fields, insert, remove, update } = useFieldArray({
    control,
    name: fieldName,
  });
  const { replace: replaceTodoSections } = useFieldArray({
    control,
    name: "todoSections",
  });

  const isActiveFieldArray = sectionFieldArrayName === parentFieldName;

  /* Filter out empty todo item on clicking away from the section. */
  /* Separate from the main submit function because I want the empty inputs to persist while the section is active. */
  const handleClickAway = useCallback(() => {
    const todoSections = getValues("todoSections");
    const todoSection = todoSections[index];
    const todoList = todoSection.list;

    const newTodoList = todoList.filter((item: TodoItemType) => {
      return !isEmpty(item.text);
    });

    if (newTodoList.length === 0) {
      const newTodoSections = todoSections.filter(
        (section: TodoSection) => section.id !== todoSection.id
      );
      replaceTodoSections(newTodoSections);
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
    <ClickAwayListener
      mouseEvent={isActiveFieldArray ? "onMouseDown" : false}
      touchEvent={isActiveFieldArray ? "onTouchStart" : false}
      onClickAway={handleClickAway}
    >
      <div onClick={handleSetSectionActive}>
        <TodoListHeader
          isActiveFieldArray={isActiveFieldArray}
          parentFieldName={parentFieldName}
          onListChecked={(event) => setListCompleted(event.target.checked)}
          onSetSectionActive={handleSetSectionActive}
        />

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

        {/* {isActiveFieldArray && (
          <div className={styles.listFooterContainer}>
            <Button>Set reminder</Button>
            <IconButton>
              <Check />
            </IconButton>
          </div>
        )} */}
      </div>
    </ClickAwayListener>
  );
};

export default TodoList;
