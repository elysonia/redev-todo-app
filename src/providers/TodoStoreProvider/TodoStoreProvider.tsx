"use client";
import { createContext, PropsWithChildren, useContext, useRef } from "react";
import { useStore } from "zustand";

import createTodoStore, { TodoStore } from "store";

export type TodoStoreApi = ReturnType<typeof createTodoStore>;
const TodoStoreContext = createContext<TodoStoreApi | undefined>(undefined);

const TodoStoreProvider = ({ children }: PropsWithChildren) => {
  const storeRef = useRef<TodoStoreApi | null>(null);
  if (storeRef.current === null) {
    storeRef.current = createTodoStore();
  }

  return (
    <TodoStoreContext.Provider value={storeRef.current}>
      {children}
    </TodoStoreContext.Provider>
  );
};

export const useTodoStore = <T,>(selector: (store: TodoStore) => T): T => {
  const todoStoreContext = useContext(TodoStoreContext);

  if (!todoStoreContext) {
    throw new Error("useTodoStoreMust be used within TodoStoreProvider");
  }

  return useStore(todoStoreContext, selector);
};

export default TodoStoreProvider;
