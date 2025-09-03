import { Checkbox, Input } from "@mui/material";
import clsx from "clsx";
import { isEmpty, isNull, uniqueId } from "lodash";
import { ChangeEvent, FocusEvent, forwardRef, useCallback } from "react";
import {
  Controller,
  RefCallBack,
  UseFieldArrayReturn,
  useFormContext,
  useWatch,
} from "react-hook-form";

import ReminderIndicator from "@components/ReminderIndicator";
import { useTodoContext } from "@providers/TodoProvider/TodoProvider";
import {
  defaultFocusedTextInputField,
  getDefaultTodoItem,
} from "@utils/todoUtils";
import { KeyboardEnum } from "enums";
import { useRefCallback } from "hooks";
import { TodoItem as TodoItemType, TodoSection } from "types";
import { FocusedTextInputField, TextInputFieldName } from "types/todo";
import styles from "./todoItem.module.css";

type ItemInputProps = {
  refCallback: RefCallBack;
  isCompleted: boolean;
  isActiveFieldArray: boolean;
  value: string;
  onBlur: () => void;
  onFocus: (event: FocusEvent<HTMLTextAreaElement>) => void;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
};

const ItemInput = forwardRef<HTMLTextAreaElement, ItemInputProps>(
  function ItemInput(props: ItemInputProps, ref) {
    const {
      refCallback,
      isCompleted,
      isActiveFieldArray,
      value,
      onBlur,
      onFocus,
      onChange,
      onKeyDown,
    } = props;

    return (
      <Input
        inputRef={useRefCallback<HTMLTextAreaElement>(refCallback)}
        className={clsx(styles.item, {
          [styles.completed]: isCompleted,
        })}
        slotProps={{
          input: {
            tabIndex: isActiveFieldArray ? 0 : -1,
          },
        }}
        value={value}
        disableUnderline
        multiline
        onBlur={onBlur}
        onFocus={onFocus}
        onChange={onChange}
        onKeyDown={onKeyDown}
      />
    );
  }
);

type ItemCheckboxProps = {
  refCallback: RefCallBack;
  isCompleted: boolean;
  isActiveFieldArray: boolean;
  value: boolean;
  onBlur?: () => void;
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onChecked: (checked: boolean) => void;
};

const ItemCheckbox = (props: ItemCheckboxProps) => {
  const { isActiveFieldArray, value, refCallback, onChange, onChecked } = props;

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onChange(event);
      onChecked(event.target.checked);
    },
    [onChange, onChecked]
  );

  return (
    <Checkbox
      slotProps={{
        input: {
          ref: useRefCallback<HTMLInputElement>(refCallback),
          tabIndex: isActiveFieldArray ? -1 : 0,
        },
      }}
      disabled={isActiveFieldArray}
      checked={value}
      onChange={handleChange}
    />
  );
};

type TodoItemProps = {
  itemIndex: number;
  sectionIndex: number;
  sectionFieldName: string;
  listFieldName: string;
  shouldShowHeader: boolean;
  listFieldArrayMethods: UseFieldArrayReturn;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
};

const TodoItem = ({
  itemIndex,
  sectionIndex,
  listFieldName,
  shouldShowHeader,
  sectionFieldName,
  listFieldArrayMethods,
  onKeyDown,
}: TodoItemProps) => {
  const {
    sectionFieldArrayName,
    focusedTextInputField,
    setFocusedTextInputField,
    setSectionFieldArrayName,
    onSubmit,
    setSnackbar,
  } = useTodoContext();
  const fieldName = `${listFieldName}.${itemIndex}.text` as TextInputFieldName;
  const { control, setValue, getValues } = useFormContext();
  const { move, insert, remove } = listFieldArrayMethods;
  const checkBoxFieldName = `${listFieldName}.${itemIndex}.isCompleted`;
  const isCompleted = useWatch({ control, name: checkBoxFieldName });

  const isActiveFieldArray = sectionFieldArrayName === sectionFieldName;

  const getInputState = (ref: HTMLTextAreaElement | null) => {
    if (!ref) {
      return {
        value: "",
        selectionStart: 0,
        length: 0,
      };
    }

    return {
      value: ref.value,
      selectionStart: ref.selectionStart,
      length: ref.value.length,
    };
  };

  const handleBackspaceKey = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      const target = event.target as HTMLTextAreaElement;
      const inputState = getInputState(target);
      const isCursorAtStart = inputState.selectionStart === 0;
      if (!isCursorAtStart) return;

      event.preventDefault();
      const todoSections = getValues("todoSections");
      const currentSection = todoSections[sectionIndex];
      const isFirstItem = itemIndex === 0;
      const isTextEmpty = inputState.length === 0;
      const hasNoSubtasks = currentSection.list.length === 1;

      const shouldCreateTaskFromTitle =
        isFirstItem && hasNoSubtasks && !!currentSection.name;

      if (shouldCreateTaskFromTitle) {
        const newTodoSections = todoSections.map((section: TodoSection) => {
          if (section.id === currentSection.id) {
            const newTodoItem = {
              ...getDefaultTodoItem(),
              text: section.name + currentSection.list[itemIndex].text,
            };

            return { ...section, name: "", list: [newTodoItem] };
          }
          return section;
        });

        const nextFocusedFieldName =
          `${listFieldName}.0.text` as TextInputFieldName;
        setValue("todoSections", newTodoSections);
        setFocusedTextInputField({
          fieldName: nextFocusedFieldName,
          selectionStart: currentSection.name.length,
        });
        return;
      }

      const prevItemIndex = itemIndex - 1;
      const isPrevItemIndexValid = prevItemIndex >= 0;
      const nextFocusedFieldName = (
        isPrevItemIndexValid
          ? `${listFieldName}.${prevItemIndex}.text`
          : `${listFieldName}.0.text`
      ) as TextInputFieldName;

      const shouldRemoveItem = isTextEmpty;
      if (shouldRemoveItem) {
        setFocusedTextInputField({
          fieldName: nextFocusedFieldName,
          selectionStart: -1,
        });
        remove(itemIndex);
        return;
      }

      const shouldMergeWithPrevText = !isFirstItem;
      if (shouldMergeWithPrevText) {
        const newPrevItemText =
          currentSection.list[prevItemIndex].text + inputState.value;
        const prevItemLength = currentSection.list[prevItemIndex].text.length;

        setFocusedTextInputField({
          fieldName: nextFocusedFieldName,
          selectionStart: prevItemLength,
        });
        setValue(`${listFieldName}.${prevItemIndex}.text`, newPrevItemText);
        remove(itemIndex);
      }
    },
    [
      itemIndex,
      sectionIndex,
      listFieldName,
      remove,
      setValue,
      getValues,
      setFocusedTextInputField,
    ]
  );

  const handleEnterKey = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      const target = event.target as HTMLTextAreaElement;
      const inputState = getInputState(target);
      /* Prevent key press from adding an extra newline. */
      event.preventDefault();
      const nextItemIndex = itemIndex + 1;

      const newCurrentItemText = inputState.value.slice(
        0,
        inputState.selectionStart
      );
      const nextItemText = inputState.value.slice(inputState.selectionStart);
      setValue(fieldName, newCurrentItemText);
      insert(nextItemIndex, {
        id: uniqueId(),
        isCompleted: false,
        text: nextItemText,
      });

      const nextItemFieldName =
        `${listFieldName}.${nextItemIndex}.text` as TextInputFieldName;

      setFocusedTextInputField({
        fieldName: nextItemFieldName,
        selectionStart: 0,
      });
    },
    [
      itemIndex,
      fieldName,
      listFieldName,
      insert,
      setValue,
      setFocusedTextInputField,
    ]
  );

  const handleArrowKey = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      const target = event.target as HTMLTextAreaElement;
      const inputState = getInputState(target);

      const nextItemIndex = itemIndex + 1;
      const prevItemIndex = itemIndex - 1;
      const currentSection = getValues(sectionFieldName);

      const isPrevItemIndexValid = prevItemIndex >= 0;
      const isNextItemIndexValid =
        nextItemIndex >= 0 && nextItemIndex < currentSection.list.length;

      const shouldFocusOnActionButtons =
        event.key === "ArrowDown" && !isNextItemIndexValid;

      if (shouldFocusOnActionButtons) {
        onKeyDown(event);
        return;
      }

      const shouldFocusOnPrevItem =
        event.key === "ArrowUp" &&
        inputState.selectionStart === 0 &&
        isPrevItemIndexValid;

      const shouldFocusOnHeaderName =
        event.key === "ArrowUp" &&
        inputState.selectionStart === 0 &&
        !isPrevItemIndexValid;

      const shouldFocusOnNextItem =
        event.key === "ArrowDown" &&
        inputState.selectionStart === inputState.length &&
        isNextItemIndexValid;

      /* Only prevent default cursor behavior when they need to move focus to another field */
      if (
        shouldFocusOnPrevItem ||
        shouldFocusOnHeaderName ||
        shouldFocusOnNextItem
      ) {
        event.preventDefault();
      }

      const nextFocusedField = (() => {
        if (shouldFocusOnPrevItem) {
          return {
            fieldName: `${listFieldName}.${prevItemIndex}.text`,
            selectionStart: 0,
          };
        }
        if (shouldFocusOnHeaderName) {
          return { fieldName: `${sectionFieldName}.name`, selectionStart: 0 };
        }
        if (shouldFocusOnNextItem) {
          return {
            fieldName: `${listFieldName}.${nextItemIndex}.text`,
            selectionStart: -1,
          };
        }
        return { fieldName: "", selectionStart: null };
      })() as FocusedTextInputField;

      /* Prevent calling setFocusedTextInputField when the focus should not change. */
      if (
        isEmpty(nextFocusedField.fieldName) &&
        isEmpty(nextFocusedField.selectionStart)
      ) {
        return;
      }

      setFocusedTextInputField(nextFocusedField);
    },
    [
      itemIndex,
      getValues,
      listFieldName,
      sectionFieldName,
      setFocusedTextInputField,
      onKeyDown,
    ]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isActiveFieldArray) return;
      switch (event.key) {
        case KeyboardEnum.KeyEnum.tab:
          onKeyDown(event);
          break;
        case KeyboardEnum.KeyEnum.enter:
          handleEnterKey(event);
          break;
        case KeyboardEnum.KeyEnum.arrowUp:
        case KeyboardEnum.KeyEnum.arrowDown:
          handleArrowKey(event);
          break;
        case KeyboardEnum.KeyEnum.backspace:
          handleBackspaceKey(event);
          break;
      }
    },
    [
      handleEnterKey,
      handleArrowKey,
      handleBackspaceKey,
      onKeyDown,
      isActiveFieldArray,
    ]
  );

  const handleChecked = useCallback(
    (isChecked: boolean) => {
      if (isActiveFieldArray) return;
      setTimeout(() => {
        if (!isChecked) {
          move(itemIndex, 0);
          return;
        }

        const todoSections = getValues("todoSections");
        const todoSection = todoSections[sectionIndex];
        const todoItem = todoSection.list[itemIndex];

        const newIncompleteTodoList = todoSection.list.filter(
          (item: TodoItemType) => {
            return !item.isCompleted;
          }
        );

        const isAllSubtasksCompleted = newIncompleteTodoList.length === 0;
        if (isAllSubtasksCompleted) {
          const newTodoSections = todoSections.filter(
            (section: TodoSection) => {
              return section.id !== todoSection.id;
            }
          );

          setValue("todoSections", newTodoSections);
          onSubmit();
          setSnackbar({
            open: true,
            message: "Task completed",
          });
          return;
        }

        const latestCompletedListItemIndex = todoSection.list.findIndex(
          (item: TodoItemType) => item.isCompleted && item.id !== todoItem.id
        );

        if (latestCompletedListItemIndex < 0) {
          move(itemIndex, todoSection.list.length - 1);
          return;
        }

        move(itemIndex, latestCompletedListItemIndex - 1);
        onSubmit();
      }, 500);
    },
    [
      itemIndex,
      sectionIndex,
      isActiveFieldArray,
      setValue,
      getValues,
      move,
      onSubmit,
      setSnackbar,
    ]
  );

  const handleFocus = useCallback(
    (event: FocusEvent<HTMLTextAreaElement>) => {
      const target = event.target as HTMLTextAreaElement;
      const inputState = getInputState(target);

      const eventCursorLocation = inputState.selectionStart;
      const shouldFocusAtStartOrMiddle =
        focusedTextInputField.fieldName === fieldName &&
        !isNull(focusedTextInputField.selectionStart) &&
        focusedTextInputField.selectionStart >= 0;
      const shouldFocusAtEnd =
        !isNull(focusedTextInputField.selectionStart) &&
        focusedTextInputField.selectionStart < 0;

      const cursorLocation = (() => {
        if (shouldFocusAtEnd) {
          return inputState.value.length;
        }
        if (shouldFocusAtStartOrMiddle) {
          return focusedTextInputField.selectionStart;
        }
        return eventCursorLocation;
      })();

      target.setSelectionRange(cursorLocation, cursorLocation, "forward");

      if (sectionFieldArrayName !== sectionFieldName) {
        setSectionFieldArrayName(sectionFieldName as `todoSections.${number}`);
        setFocusedTextInputField({
          fieldName,
          selectionStart: cursorLocation,
        });
      }
    },
    [
      fieldName,
      focusedTextInputField,
      sectionFieldArrayName,
      sectionFieldName,
      setSectionFieldArrayName,
      setFocusedTextInputField,
    ]
  );

  const handleBlur = useCallback(() => {
    setFocusedTextInputField(defaultFocusedTextInputField);
  }, [setFocusedTextInputField]);

  return (
    <div className={styles.listItem}>
      <div className={styles.itemContainer}>
        <Controller
          control={control}
          name={checkBoxFieldName}
          render={({ field: { ref: refCallback, value, onChange } }) => {
            return (
              <ItemCheckbox
                value={value}
                isCompleted={isCompleted}
                isActiveFieldArray={isActiveFieldArray}
                refCallback={refCallback}
                onChange={onChange}
                onChecked={handleChecked}
              />
            );
          }}
        />

        <Controller
          control={control}
          name={fieldName}
          render={({ field: { ref: refCallback, value, onChange } }) => {
            return (
              <ItemInput
                refCallback={refCallback}
                isCompleted={isCompleted}
                isActiveFieldArray={isActiveFieldArray}
                value={value}
                onBlur={handleBlur}
                onFocus={handleFocus}
                onChange={onChange}
                onKeyDown={handleKeyDown}
              />
            );
          }}
        />
      </div>

      {!shouldShowHeader && (
        <ReminderIndicator
          isActiveFieldArray={isActiveFieldArray}
          sectionFieldName={sectionFieldName}
        />
      )}
    </div>
  );
};

export default TodoItem;
