import { useState } from "react";
import "./App.css";
import Header from "./components/Header";
import NextTask from "./components/NextTask";
import TaskInput from "./components/TaskInput";
import TaskList from "./components/TaskList";

function App() {
  const [tasks, setTasks] = useState([]);

  function addTask(text) {
    const newTask = {
      id: Date.now(),
      text: text,
      done: false,
    };

    setTasks([...tasks, newTask]);
  }

  return (
    <main className="app">
      <Header />
      <NextTask />
      <TaskInput onAddTask={addTask} />
      <TaskList tasks={tasks} />
    </main>
  );
}

export default App;