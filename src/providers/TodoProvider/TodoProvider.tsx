"use client";

import { Snackbar, SnackbarProps } from "@mui/material";
import dayjs from "dayjs";
import { debounce, isEmpty } from "lodash";
import {
  createContext,
  PropsWithChildren,
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  EventType,
  FormProvider,
  FormState,
  InternalFieldName,
  useForm,
} from "react-hook-form";
import { VListHandle } from "virtua";
import { useShallow } from "zustand/react/shallow";

import { useAudioPlayerContext } from "@providers/AudioPlayerProvider/AudioPlayerProvider";
import { useTodoStore } from "@providers/TodoStoreProvider";
import { defaultFocusedTextInputField } from "@utils/todoUtils";
import { defaultTodoDraft } from "store";
import {
  FocusedTextInputField,
  TodoSection,
  TodoSectionDayjs,
} from "types/todo";

type TodoForm = {
  todoSections: TodoSection[];
};

type RHFSubscribeProps = Partial<FormState<TodoForm>> & {
  values: TodoForm;
  name?: InternalFieldName;
  type?: EventType;
};

type TodoContextProps = {
  vListRef: RefObject<VListHandle | null>;
  snackbar: SnackbarProps;
  focusedTextInputField: FocusedTextInputField;
  sectionFieldArrayName: `todoSections.${number}` | "";
  setSnackbar: (props: SnackbarProps) => void;
  setFocusedTextInputField: (focusedField: FocusedTextInputField) => void;
  setSectionFieldArrayName: (sectionId: `todoSections.${number}` | "") => void;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
};

const defaultTodoContext: TodoContextProps = {
  vListRef: { current: null },
  snackbar: {},
  focusedTextInputField: defaultFocusedTextInputField,
  sectionFieldArrayName: "",
  setSnackbar: () => {},
  setFocusedTextInputField: () => {},
  setSectionFieldArrayName: () => {},
  onSubmit: async () => {},
};
export const TodoContext = createContext<TodoContextProps>(defaultTodoContext);

const TodoProvider = ({ children }: PropsWithChildren) => {
  const vListRef = useRef<VListHandle | null>(null);
  /* Path to the current section in the form. */
  const [sectionFieldArrayName, setSectionFieldArrayName] = useState<
    `todoSections.${number}` | ""
  >("");
  /* Path to the current field in focus in the form. */
  const [focusedTextInputField, setFocusedTextInputField] =
    useState<FocusedTextInputField>(defaultTodoContext.focusedTextInputField);
  const [snackbar, setSnackbar] = useState<SnackbarProps>({});
  const [shouldRestoreDraft, setShouldRestoreDraft] = useState(true);

  const {
    todoSections,
    todoDraft,
    isHydrated,
    updateTodoSection,
    updateTodoSections,
    updateTodoDraft,
  } = useTodoStore(useShallow((state) => state));
  const { isPlaying, onPlayAudio } = useAudioPlayerContext();
  const methods = useForm<TodoForm>();
  const {
    reset,
    subscribe,
    setFocus,
    setValue,
    getValues,
    handleSubmit: RHFHandleSubmit,
  } = methods;

  const snackbarProps = useMemo(() => {
    if (isEmpty(snackbar)) {
      return {
        open: false,
      };
    }

    return snackbar;
  }, [snackbar]);

  const handleSubmit = RHFHandleSubmit(({ todoSections }) => {
    handleSaveDraft.cancel();
    updateTodoDraft(defaultTodoDraft);
    updateTodoSections(todoSections);
  });

  const handleCloseSnackbar = useCallback(
    (event: React.SyntheticEvent | Event, reason: string) => {
      const ignoreReasonsList = ["clickaway", "escapeKeyDown"];
      if (ignoreReasonsList.includes(reason)) return;

      setSnackbar({});
    },
    [setSnackbar]
  );

  /* Saves the draft automatically every half a second.  */
  const handleSaveDraft = useCallback(
    debounce((props: RHFSubscribeProps) => {
      const { values, isDirty } = props;

      if (!isDirty) return;
      updateTodoDraft({
        isDirty: Boolean(isDirty),
        sectionFieldArrayName,
        focusedTextInputField,
        values: values.todoSections,
      });
    }, 500),
    [sectionFieldArrayName, focusedTextInputField, updateTodoDraft, getValues]
  );

  const activeRemindersArray = useMemo(() => {
    return todoSections
      .reduce((accum, section, index) => {
        const activeSection = sectionFieldArrayName
          ? getValues(sectionFieldArrayName)
          : null;

        if (
          !section.isCompleted &&
          section.reminderDateTime &&
          !section.isReminderExpired &&
          section.id !== activeSection?.id
        ) {
          accum.push([
            index,
            { ...section, reminderDateTime: dayjs(section.reminderDateTime) },
          ]);
        }
        return accum;
      }, [] as Array<[number, TodoSectionDayjs]>)
      .sort((a, b) => {
        const reminderA = a[1].reminderDateTime;
        const reminderB = b[1].reminderDateTime;

        if (reminderA?.isBefore(reminderB)) return -1;
        if (reminderA?.isAfter(reminderB)) return 1;
        return 0;
      });
  }, [todoSections, getValues, sectionFieldArrayName]);

  const showDesktopNotification = useCallback(
    (reminder: TodoSectionDayjs) => {
      if (Notification.permission === "granted") {
        const incompleteTasks = reminder.list.filter(
          (item) => !item.isCompleted
        );

        const overflowText = incompleteTasks.length > 5 ? "..." : "";
        const incompleteTaskPreviewString = incompleteTasks
          .slice(0, 5)
          .map((task) => task.text)
          .join(", ")
          .concat(overflowText);

        const time = reminder.reminderDateTime
          ? reminder.reminderDateTime.format("h:mm A")
          : "";

        const body = `${incompleteTasks.length} out of ${reminder.list.length} left to do. ${incompleteTaskPreviewString}`;
        new Notification(
          `Reminder for ${reminder.name || "Subtasks"} at ${time}`,
          {
            body,
            icon: "/favicon.ico",
            tag: reminder.id,
            requireInteraction: true,
          }
        );

        /* Prevent audio restarting when multiple reminders are activating at the same time. */
        if (isPlaying) return;
        onPlayAudio();
      }
    },
    [onPlayAudio, isPlaying]
  );

  const todoValue: TodoContextProps = useMemo(() => {
    return {
      vListRef,
      snackbar,
      focusedTextInputField,
      sectionFieldArrayName,
      setSnackbar,
      setFocusedTextInputField,
      setSectionFieldArrayName,
      onSubmit: handleSubmit,
    };
  }, [
    vListRef,
    snackbar,
    focusedTextInputField,
    sectionFieldArrayName,
    setSnackbar,
    setFocusedTextInputField,
    setSectionFieldArrayName,
    handleSubmit,
  ]);

  /* Subscribe to value updates without re-rendering the entire form for draft autosave. */
  useEffect(() => {
    const handleSubscribe = subscribe({
      formState: {
        values: true,
        isDirty: true,
      },
      callback: (props) => handleSaveDraft(props),
    });

    return () => handleSubscribe();
  }, [subscribe, handleSaveDraft]);

  /* Detects data change from the store and updates form default values. */
  useEffect(() => {
    if (!isHydrated) return;
    reset({ todoSections });
  }, [todoSections, reset, isHydrated]);

  /* If the form somehow did not save before exiting, restore the draft. */
  useEffect(() => {
    if (!isHydrated) return;
    if (!shouldRestoreDraft) return;
    if (!todoDraft.isDirty) {
      setShouldRestoreDraft(false);
      return;
    }

    setFocusedTextInputField(todoDraft.focusedTextInputField);
    setSectionFieldArrayName(todoDraft.sectionFieldArrayName);
    setValue("todoSections", todoDraft.values);
    setSnackbar({
      open: true,
      message: `Unsaved changes detected, draft restored`,
    });
  }, [
    todoDraft,
    shouldRestoreDraft,
    isHydrated,
    setValue,
    setSnackbar,
    setFocusedTextInputField,
    setShouldRestoreDraft,
    setSectionFieldArrayName,
  ]);

  /* Send desktop notification when the reminder date times match current time. */
  useEffect(() => {
    const timer = setInterval(() => {
      const currentTime = dayjs().format("YYYY:M:D:hh:mm");

      activeRemindersArray.forEach((reminderEntry) => {
        const [, reminder] = reminderEntry;
        const reminderDateTime = dayjs(reminder.reminderDateTime);
        const reminderTime = reminderDateTime.format("YYYY:M:D:hh:mm");

        if (currentTime === reminderTime) {
          showDesktopNotification(reminder);
          updateTodoSection({
            ...reminder,
            reminderDateTime,
            isReminderExpired: true,
          });
        }
      });
    }, 10000);

    return () => clearInterval(timer);
  }, [activeRemindersArray, updateTodoSection, showDesktopNotification]);

  /* Set focus on the current fieldName if it changes */
  useEffect(() => {
    if (!isEmpty(focusedTextInputField.fieldName)) {
      setFocus(focusedTextInputField.fieldName);
    }
  }, [focusedTextInputField, setFocus]);

  return (
    <TodoContext.Provider value={todoValue}>
      <FormProvider {...methods}>{children}</FormProvider>
      <Snackbar
        autoHideDuration={2000}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        onClose={handleCloseSnackbar}
        {...snackbarProps}
      />
    </TodoContext.Provider>
  );
};

export const useTodoContext = () => {
  const context = useContext(TodoContext);

  if (!context) {
    throw new Error("useTodoContext must be used within a TodoProvider");
  }

  return context;
};

export default TodoProvider;
