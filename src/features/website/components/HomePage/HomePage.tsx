import TodoPage from "@todoApp/components/TodoPage";
import styles from "./homepage.module.css";

const HomePage = () => {
  return (
    <div className={styles.container}>
      <h1>Re:Dev</h1>
      <h2>Trash isekai-themed website</h2>
      <p>Maybe this time I'll be a good dev!</p>

      <hgroup>
        <h3>Projects</h3>
        <ol>
          <li>Todo App (the most basic one)</li>
          <li>Games</li>
        </ol>
      </hgroup>
      <h1> BELOW IS A WIP, WILL BE IN ANOTHER PAGE WHEN DONE</h1>
      <TodoPage />
    </div>
  );
};

export default HomePage;
