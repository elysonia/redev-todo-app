import { CheckCircle } from "@mui/icons-material";
import { ClickAwayListener, IconButton, List, Tooltip } from "@mui/material";
import clsx from "clsx";
import dayjs from "dayjs";
import { isEmpty, uniqueId } from "lodash";
import { forwardRef, useCallback, useEffect, useMemo, useRef } from "react";
import {
  Controller,
  RefCallBack,
  useFieldArray,
  useFormContext,
  useWatch,
} from "react-hook-form";

import ButtonFieldDateTimePicker from "@components/ButtonDateTimePicker";
import TodoItem from "@components/TodoItem";
import TodoListHeader from "@components/TodoListHeader";
import { useTodoContext } from "@providers/TodoProvider/TodoProvider";
import { KeyboardEnum } from "enums";
import { useRefCallback } from "hooks";
import {
  HTMLDivButtonElement,
  TodoItem as TodoItemType,
  TodoSection,
} from "types";
import { ObjectInputFieldName, TextInputFieldName } from "types/todo";
import styles from "./todoList.module.css";

type TodoListProps = {
  sectionIndex: number;
  sectionFieldName: `todoSections.${number}`;
  refCallback: RefCallBack;
};

const TodoList = forwardRef<HTMLDivElement, TodoListProps>(function TodoList(
  props: TodoListProps,
  ref
) {
  const { sectionIndex, sectionFieldName, refCallback } = props;

  const fieldName = `todoSections.${sectionIndex}.list`;
  const reminderDateFieldName = `todoSections.${sectionIndex}.reminderDateTime`;
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const reminderDateTimeRef = useRef<HTMLDivButtonElement>(null);
  const {
    focusedTextInputField,
    sectionFieldArrayName,
    onSubmit,
    setSnackbar,
    setFocusedTextInputField,
    setSectionFieldArrayName,
  } = useTodoContext();
  const { control, getValues, setFocus, setValue } = useFormContext();
  const listFieldArrayMethods = useFieldArray({
    control,
    name: fieldName,
  });
  const { fields } = listFieldArrayMethods;
  const headerInputFieldName = `${sectionFieldName}.name` as TextInputFieldName;

  const isReminderExpired = useWatch({
    control,
    name: `${sectionFieldName}.isReminderExpired`,
  });

  const isActiveFieldArray = sectionFieldArrayName === sectionFieldName;
  const shouldShowHeader = useMemo(() => {
    const headerFieldName = `${sectionFieldName}.name`;
    const headerFieldValue = getValues(headerFieldName);

    const hasNoHeaderName = isEmpty(headerFieldValue);
    const hasNoSubtasks = fields.length === 1;

    if (hasNoSubtasks && hasNoHeaderName) return false;
    if (!isActiveFieldArray) return true;
    return true;
  }, [sectionFieldName, isActiveFieldArray, fields, getValues]);

  /* Filter out empty todo item on clicking away from the section. */
  const handleClickAway = useCallback(() => {
    const todoSections = getValues("todoSections");
    const todoSection = todoSections[sectionIndex];
    const todoList = todoSection.list;

    const newTodoList = todoList.filter((item: TodoItemType) => {
      return !isEmpty(item.text);
    });

    const hasNoSubtask = newTodoList.length === 0;
    const shouldCreateListItemFromSectionName =
      hasNoSubtask && todoSection.name;
    const shouldRemoveSection = hasNoSubtask && !todoSection.name;

    if (shouldCreateListItemFromSectionName) {
      const newTodoSection: TodoSection = {
        id: todoSection.id,
        name: "",
        isCompleted: false,
        isReminderExpired: false,
        list: [
          {
            id: uniqueId(),
            isCompleted: false,
            text: todoSection.name,
          },
        ],
      };
      setValue(sectionFieldName, newTodoSection);
    } else if (shouldRemoveSection) {
      const newTodoSections = todoSections.filter(
        (section: TodoSection) => section.id !== todoSection.id
      );
      setValue("todoSections", newTodoSections);
    } else {
      setValue(fieldName, newTodoList);
    }

    setSectionFieldArrayName("");
    setFocusedTextInputField({
      fieldName: "",
      selectionStart: null,
    });
    onSubmit();
    setSnackbar({ open: true, message: `Tasks saved` });
  }, [
    sectionIndex,
    fieldName,
    setSnackbar,
    setSectionFieldArrayName,
    getValues,
    setValue,
    onSubmit,
    sectionFieldName,
    setFocusedTextInputField,
  ]);

  const handleSelectSection = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === KeyboardEnum.KeyEnum.enter) {
        if (isActiveFieldArray) return;
        /* Prevent adding a newline to the header input */
        event.preventDefault();
        setSectionFieldArrayName(sectionFieldName);
        setFocus(headerInputFieldName);
        return;
      }
      if (event.key === KeyboardEnum.KeyEnum.escape) {
        if (!isActiveFieldArray) return;
        event.preventDefault();
        setSectionFieldArrayName("");
        setFocus(sectionFieldName);
        return;
      }
    },
    [
      sectionFieldName,
      headerInputFieldName,
      isActiveFieldArray,
      setFocus,
      setSectionFieldArrayName,
    ]
  );

  /* If the user sets a new reminder, reset isReminderExpired. */
  const handleReminderChange = useCallback(() => {
    const todoSection = getValues(sectionFieldName);
    const newTodoSection = {
      ...todoSection,
      isReminderExpired: false,
    };
    setValue(sectionFieldName, newTodoSection);
  }, [getValues, setValue, sectionFieldName]);

  const handleKeyDown = useCallback(
    (
      event: React.KeyboardEvent<
        HTMLInputElement | HTMLDivElement | HTMLButtonElement
      >
    ) => {
      /* If tab key is pressed, switch to and between the action buttons. */
      if (event.key === KeyboardEnum.KeyEnum.tab) {
        event.preventDefault();

        if (event.target === submitButtonRef.current) {
          setFocusedTextInputField({
            fieldName: reminderDateFieldName as ObjectInputFieldName,
            selectionStart: null,
          });
          setFocus(reminderDateFieldName);
          return;
        }

        if (event.target === reminderDateTimeRef.current) {
          submitButtonRef.current?.focus();
          setFocusedTextInputField({
            fieldName: "",
            selectionStart: null,
          });
          return;
        }

        setFocusedTextInputField({
          fieldName: reminderDateFieldName as ObjectInputFieldName,
          selectionStart: null,
        });
        setFocus(reminderDateFieldName);
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        if (event.target === submitButtonRef.current) {
          setFocusedTextInputField({
            fieldName: reminderDateFieldName as ObjectInputFieldName,
            selectionStart: null,
          });
          setFocus(reminderDateFieldName);
          return;
        }
        const lastItemIndex = getValues(fieldName).length - 1;
        const lastItemFieldName =
          `${fieldName}.${lastItemIndex}.text` as TextInputFieldName;
        setFocusedTextInputField({
          fieldName: lastItemFieldName,
          selectionStart: -1,
        });
        setFocus(lastItemFieldName);
        return;
      }
      if (event.key === "ArrowDown") {
        if (event.target === submitButtonRef.current) return;
        event.preventDefault();
        if (event.target === reminderDateTimeRef.current) {
          submitButtonRef.current?.focus();
          /* Submit button is not registered in the form */
          setFocusedTextInputField({
            fieldName: "",
            selectionStart: null,
          });
          return;
        }
        setFocusedTextInputField({
          fieldName: reminderDateFieldName as ObjectInputFieldName,
          selectionStart: null,
        });
        setFocus(reminderDateFieldName);
      }
    },
    [
      reminderDateFieldName,
      fieldName,
      setFocus,
      getValues,
      setFocusedTextInputField,
    ]
  );

  useCallback(
    (ref: HTMLDivButtonElement) => {
      refCallback(ref);
      reminderDateTimeRef.current = ref;
    },
    [refCallback]
  );

  useEffect(() => {
    if (!isActiveFieldArray) return;
    if (focusedTextInputField.fieldName) return;
    const lastItemFieldName = `${fieldName}.${getValues(fieldName).length - 1}`;
    setFocus(lastItemFieldName);
  }, [
    isActiveFieldArray,
    focusedTextInputField,
    fieldName,
    setFocus,
    getValues,
  ]);

  return (
    <ClickAwayListener
      key={sectionIndex}
      mouseEvent={isActiveFieldArray ? "onMouseDown" : false}
      touchEvent={isActiveFieldArray ? "onTouchStart" : false}
      onClickAway={handleClickAway}
    >
      <div
        ref={useRefCallback<HTMLDivElement>(refCallback)}
        tabIndex={0}
        className={clsx(styles.listContainer, {
          [styles.isOverdue]: isReminderExpired,
        })}
        onKeyDown={handleSelectSection}
      >
        {shouldShowHeader && (
          <TodoListHeader
            isActiveFieldArray={isActiveFieldArray}
            sectionFieldName={sectionFieldName}
            onKeyDown={handleKeyDown}
          />
        )}

        <List>
          {fields.map((item, itemIndex: number) => (
            <TodoItem
              key={item.id}
              itemIndex={itemIndex}
              sectionIndex={sectionIndex}
              sectionFieldName={`todoSections.${sectionIndex}`}
              listFieldName={fieldName}
              listFieldArrayMethods={listFieldArrayMethods}
              shouldShowHeader={shouldShowHeader}
              onKeyDown={handleKeyDown}
            />
          ))}
        </List>
        {isActiveFieldArray && (
          <div className={styles.listFooterContainer}>
            <Controller
              control={control}
              name={reminderDateFieldName}
              render={({ field: { ref: refCallback, value, onChange } }) => {
                return (
                  <ButtonFieldDateTimePicker
                    disablePast
                    ref={useRefCallback<HTMLDivButtonElement>(
                      refCallback,
                      reminderDateTimeRef
                    )}
                    value={value ? dayjs(value) : value}
                    sx={{
                      textTransform: "capitalize",
                    }}
                    slotProps={{
                      actionBar: {
                        actions: ["clear", "cancel", "nextOrAccept"],
                      },
                      field: {
                        tabIndex: isActiveFieldArray ? 0 : -1,
                        onKeyDown: handleKeyDown,
                      },
                    }}
                    onChange={(event) => {
                      handleReminderChange();
                      onChange(event);
                    }}
                  />
                );
              }}
            />
            <Tooltip describeChild title="Done">
              <IconButton
                ref={submitButtonRef}
                tabIndex={isActiveFieldArray ? 0 : -1}
                onKeyDown={handleKeyDown}
                onClick={handleClickAway}
              >
                <CheckCircle fontSize="large" />
              </IconButton>
            </Tooltip>
          </div>
        )}
      </div>
    </ClickAwayListener>
  );
});

export default TodoList;
