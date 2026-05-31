import { useEffect, useState } from "react";
import "./App.css";
import Header from "./components/Header";
import NextTask from "./components/NextTask";
import TaskInput from "./components/TaskInput";
import TaskList from "./components/TaskList";

function App() {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem("tasks");
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  function getDueDate(text) {
    const lowerText = text.toLowerCase();
    const today = new Date();

    if (lowerText.includes("tomorrow")) {
      today.setDate(today.getDate() + 1);
      return today.toISOString();
    }

    if (lowerText.includes("today")) {
      return today.toISOString();
    }

    return null;
  }

  function addTask(text) {
    const newTask = {
      id: Date.now(),
      text: text,
      done: false,
      dueDate: getDueDate(text),
    };

    setTasks([...tasks, newTask]);
  }

  function toggleTask(id) {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  }

  function deleteTask(id) {
    setTasks(tasks.filter((task) => task.id !== id));
  }

  function editTask(id, newText) {
    setTasks(
      tasks.map((task) =>
        task.id === id 
          ? { ...task, text: newText, dueDate: getDueDate(newText) } 
          : task
      )
    );
  }

  return (
    <main className="app">
      <Header />
      <NextTask tasks={tasks} />
      <TaskInput onAddTask={addTask} />
      <TaskList 
        tasks={tasks} 
        onToggleTask={toggleTask}
        onDeleteTask={deleteTask} 
        onEditTask={editTask}
      />
    </main>
  );
}

export default App;