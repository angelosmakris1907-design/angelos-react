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

  function getDueTime(text) {
    const lowerText = text.toLowerCase();
    const match = lowerText.match(/at (\d{1,2})(:\d{2})?/);

    if (!match) return null;

    const hour = match[1];
    const minutes = match[2] ? match[2].replace(":", "") : "00";

    return `${hour}:${minutes}`;
  }

  function getTaskDateTime(task) {
    if (!task.dueDate) return null;

    const date = new Date(task.dueDate);

    if (task.dueTime) {
      const [hour, minute] = task.dueTime.split(":");

      date.setHours(
        Number(hour),
        Number(minute),
        0,
        0
      );
    }
  
    

    return date;
  }

  function getDueStatus(task) {
   if (!task.dueDate) return "";

   const now = new Date();
   const dueDate = getTaskDateTime(task);

   if (dueDate < now) return "Overdue";

   if (dueDate.toDateString() === now.toDateString()) {
     return "Due today";
   }

   return "";
  }

  function addTask(text) {
    const newTask = {
      id: Date.now(),
      text: text,
      done: false,
      dueDate: getDueDate(text),
      duetime: getDueTime(text),
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
          ? { 
            ...task, 
            text: newText, 
            dueDate: getDueDate(newText), 
            duetime: getDueTime(newText) 
          } 
          : task
      )
    );
  }

  const sortedTasks = [...tasks].sort((a, b) => {
      const dateA = getTaskDateTime(a);
      const dateB = getTaskDateTime(b);

      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;

      return dateA - dateB;
    });

  return (
    <main className="app">
      <Header />
      <NextTask tasks={tasks} />
      <TaskInput onAddTask={addTask} />
      <TaskList 
        tasks={sortedTasks} 
        onToggleTask={toggleTask}
        onDeleteTask={deleteTask} 
        onEditTask={editTask}
        getDueStatus={getDueStatus}
      />
    </main>
  );
}

export default App;