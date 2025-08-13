"use client";

import { Snackbar, SnackbarProps } from "@mui/material";
import { useIdle } from "@uidotdev/usehooks";
import dayjs from "dayjs";
import { debounce, isEmpty } from "lodash";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  EventType,
  FormProvider,
  FormState,
  InternalFieldName,
  useForm,
} from "react-hook-form";
import { useShallow } from "zustand/react/shallow";

import { useAudioPlayerContext } from "@providers/AudioPlayerProvider/AudioPlayerProvider";
import { useTodoStore } from "@providers/TodoStoreProvider";
import { defaultTodoDraft } from "store";
import { TodoSection } from "types";

type TodoForm = {
  todoSections: TodoSection[];
};

type RHFSubscribeProps = Partial<FormState<TodoForm>> & {
  values: TodoForm;
  name?: InternalFieldName;
  type?: EventType;
};

type TodoContextProps = {
  snackbar: SnackbarProps;
  todoSections: TodoSection[];
  focusedFieldName: string;
  sectionFieldArrayName: `todoSections.${number}` | "";
  setSnackbar: (props: SnackbarProps) => void;
  setFocusedFieldName: (fieldName: string) => void;
  setSectionFieldArrayName: (sectionId: `todoSections.${number}` | "") => void;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
};

const defaultTodoContext: TodoContextProps = {
  snackbar: {},
  todoSections: [],
  focusedFieldName: "",
  sectionFieldArrayName: "",
  setSnackbar: () => {},
  setFocusedFieldName: () => {},
  setSectionFieldArrayName: () => {},
  onSubmit: async () => {},
};
export const TodoContext = createContext<TodoContextProps>(defaultTodoContext);

const TodoProvider = ({ children }: PropsWithChildren) => {
  /* TODO: Replace with local hook because I'm not using the library much */
  const isIdle = useIdle(5000);
  /* Path to the current section in the form. */
  const [sectionFieldArrayName, setSectionFieldArrayName] = useState<
    `todoSections.${number}` | ""
  >("");
  /* Path to the current field in focus in the form. */
  const [focusedFieldName, setFocusedFieldName] = useState("");

  const [snackbar, setSnackbar] = useState<SnackbarProps>({});
  const [shouldSaveOnIdle, setShouldSaveOnIdle] = useState(false);
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
    formState: { isDirty },
    subscribe,
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
        focusedFieldName,
        values: values.todoSections,
      });
    }, 500),
    [sectionFieldArrayName, focusedFieldName, updateTodoDraft, getValues]
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
      }, [] as Array<[number, TodoSection]>)
      .sort((a, b) => {
        const reminderA = a[1].reminderDateTime;
        const reminderB = b[1].reminderDateTime;

        if (reminderA?.isBefore(reminderB)) return -1;
        if (reminderA?.isAfter(reminderB)) return 1;
        return 0;
      });
  }, [todoSections, getValues, sectionFieldArrayName]);

  const showNotification = useCallback(
    (reminder: TodoSection) => {
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

        const body = `${incompleteTasks.length} out of ${reminder.list.length} left to do.\nRemaining: ${incompleteTaskPreviewString}`;
        new Notification(
          `Reminder for ${reminder.name || "Subtasks"} at ${time}`,
          {
            body,
          }
        );

        if (isPlaying) return;
        onPlayAudio();
      }
    },
    [onPlayAudio, isPlaying]
  );

  const todoValue: TodoContextProps = useMemo(() => {
    return {
      snackbar,
      todoSections,
      focusedFieldName,
      sectionFieldArrayName,
      setSnackbar,
      setFocusedFieldName: setFocusedFieldName,
      setSectionFieldArrayName,
      onSubmit: handleSubmit,
    };
  }, [
    snackbar,
    todoSections,
    focusedFieldName,
    sectionFieldArrayName,
    setSnackbar,
    setFocusedFieldName,
    setSectionFieldArrayName,
    handleSubmit,
  ]);

  /* Detects data change from the store and updates form default values. */
  useEffect(() => {
    reset({ todoSections });
  }, [todoSections]);

  /* Subscribe to value updates without re-rendering the entire form for draft autosave. */
  useEffect(() => {
    const handleSubscribe = subscribe({
      formState: {
        values: true,
        isDirty: true,
      },
      callback: handleSaveDraft,
    });

    return () => handleSubscribe();
  }, [subscribe, handleSaveDraft]);

  /* Autosaves form data after 5 seconds of inactivity. */
  useEffect(() => {
    if (isIdle && shouldSaveOnIdle) {
      /* Prevent endless API call */
      setShouldSaveOnIdle(false);
      handleSubmit();
      setSnackbar({ open: true, message: `Tasks saved` });
    } else {
      setShouldSaveOnIdle(isDirty);
    }
  }, [
    isIdle,
    shouldSaveOnIdle,
    isDirty,
    handleSubmit,
    setShouldSaveOnIdle,
    setSnackbar,
  ]);

  /* https://zustand.docs.pmnd.rs/integrations/persisting-store-data#usage-in-next.js  */
  /* If the form somehow did not save before exiting, restore the draft. */
  useEffect(() => {
    if (!isHydrated) return;
    if (!shouldRestoreDraft) return;
    if (!todoDraft.isDirty) {
      setShouldRestoreDraft(false);
      return;
    }

    if (shouldRestoreDraft && todoDraft.isDirty) {
      setFocusedFieldName(todoDraft.focusedFieldName);
      setSectionFieldArrayName(todoDraft.sectionFieldArrayName);
      setValue("todoSections", todoDraft.values);
      setSnackbar({
        open: true,
        message: `Unsaved changes detected, draft restored`,
      });
      setShouldRestoreDraft(false);
    }
  }, [
    isHydrated,
    shouldRestoreDraft,
    todoDraft,
    setValue,
    setSnackbar,
    setFocusedFieldName,
    setSectionFieldArrayName,
    setShouldRestoreDraft,
  ]);

  /* Send desktop notification when the reminder date times match current time. */
  useEffect(() => {
    const timer = setInterval(() => {
      const currentTime = dayjs().format("YYYY:M:D:hh:mm");

      activeRemindersArray.forEach((reminderEntry) => {
        const [sectionIndex, reminder] = reminderEntry;
        const reminderTime =
          reminder.reminderDateTime?.format("YYYY:M:D:hh:mm");

        if (currentTime === reminderTime) {
          showNotification(reminder);
          updateTodoSection({
            ...reminder,
            isReminderExpired: true,
          });
        }
      });
    }, 10000);

    return () => clearInterval(timer);
  }, [activeRemindersArray, updateTodoSection, showNotification]);

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
