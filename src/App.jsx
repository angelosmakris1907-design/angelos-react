import { useEffect, useState } from "react";
import "./App.css";
import Header from "./components/Header";
import NextTask from "./components/NextTask";
import TaskInput from "./components/TaskInput";
import TaskList from "./components/TaskList";
import VoiceButton from "./components/VoiceButton";

function App() {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem("tasks");
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  const [lastDeletedTask, setLastDeletedTask] = useState(null);

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
      text: cleanTaskText(text),
      done: false,
      dueDate: getDueDate(text),
      dueTime: getDueTime(text),
      priority: getPriority(text),
    };

    setTasks([...tasks, newTask]);
    return newTask;
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
            text: cleanTaskText(newText), 
            dueDate: getDueDate(newText), 
            dueTime: getDueTime(newText),
            priority: getPriority(newText), 
          } 
          : task
      )
    );
  }

  function buildConfirmation(task) {
    let message = "I added " + task.text;

    if (task.dueDate) {
     const dueDate = new Date(task.dueDate);
     const today = new Date();

      if (dueDate.toDateString() === today.toDateString()) {
        message += " for today";
      } else {
        message += " for tomorrow";
      }
    }

     if (task.dueTime) {
       message += " at " + task.dueTime;
     }

    return message + ".";
  }

  function cleanTaskText(text) {
    return text
      .replace(/tomorrow/gi, "")
      .replace(/today/gi, "")
      .replace(/at \d{1,2}(:\d{2})?/gi, "")
      .replace(/urgent/gi, "")
      .replace(/important/gi, "")
      .replace(/high priority/gi, "")
      .replace(/low priority/gi, "")
      .replace(/not urgent/gi, "")
      .trim();
  }

  function changePriority(id, priority) {
    setTasks(
      tasks.map((task) =>
        task.id === id
          ? { ...task, priority }
          : task
      )
    );
  }

  function handleVoiceInput(text) {
    const lowerText = text.toLowerCase();

    if (
      lowerText.includes("what is my next task") ||
      lowerText.includes("what's my next task") ||
      lowerText.includes("what should i do")
    ) {
      const nextTask = getNextTask();

      if (!nextTask) {
        speak("You have no active tasks.");
        return;
      }

     speak("Your next task is " + nextTask.text);
     return;
    }

    if (
      lowerText.includes("read my tasks") ||
      lowerText.includes("tell me my tasks")
    ) {
      readTasksAloud();
      return;
    }

    if (
      lowerText.includes("how many tasks") ||
      lowerText.includes("how many things do i have")
    ) {
      const activeCount = tasks.filter((task) => !task.done).length;
      const completedCount = tasks.filter((task) => task.done).length;

      speak(
        `You have ${activeCount} active tasks and ${completedCount} completed tasks.`
      );

      return;
    }

    if (
      lowerText.startsWith("mark ") &&
      lowerText.includes(" complete")
    ) {
      const taskName = lowerText
        .replace("mark ", "")
        .replace(" complete", "")
        .trim();

      completeTaskByName(taskName);

      return;
    }

    if (
      lowerText.startsWith("delete ") ||
      lowerText.startsWith("remove ")
    ) {
      const taskName = lowerText
        .replace("delete ", "")
        .replace("remove ", "")
        .trim();

      deleteTaskByName(taskName);
      return;
    }

    if (
     lowerText === "undo" ||
     lowerText.includes("undo delete") ||
     lowerText.includes("restore task")
    ) {
     if (!lastDeletedTask) {
       speak("There is no deleted task to restore.");
       return;
     }

     setTasks([...tasks, lastDeletedTask]);
     setLastDeletedTask(null);
     speak("I restored the task.");
     return;
    }

    if (
      lowerText.includes("what do i have due today") ||
      lowerText.includes("what is due today") ||
      lowerText.includes("tasks due today")
    ) {
      readDueToday();
      return;
    }

    if (
      lowerText.includes("what is overdue") ||
      lowerText.includes("what tasks are overdue") ||
      lowerText.includes("overdue tasks")
    ) {
      readOverdueTasks();
      return;
    }

    if (
      lowerText.startsWith("rename ") &&
      lowerText.includes(" to ")
    ) {
      const parts = lowerText
        .replace("rename ", "")
        .split(" to ");

      if (parts.length === 2) {
        editTaskByName(
          parts[0].trim(),
          parts[1].trim()
        );
      }

      return;
    }

    const task = addTask(text);
    speak(buildConfirmation(task));
  }

  function completeTaskByName(taskName) {
    const matchingTask = tasks.find(
      (task) =>
        !task.done &&
        task.text.toLowerCase().includes(taskName)
    );

    if (!matchingTask) {
      speak("I could not find that task.");
      return;
    }

    toggleTask(matchingTask.id);

    speak(
      matchingTask.text + " marked as complete."
    );
  }

  function deleteTaskByName(taskName) {
    const matchingTask = tasks.find((task) =>
      task.text.toLowerCase().includes(taskName)
    );

    if (!matchingTask) {
      speak("I could not find that task.");
      return;
    }

    setLastDeletedTask(matchingTask);
    deleteTask(matchingTask.id);
    speak("I deleted " + matchingTask.text + ". Say undo to restore it.");
  }

  function editTaskByName(oldName, newName) {
    const matchingTask = tasks.find(
      (task) =>
        task.text.toLowerCase().includes(oldName)
    );

    if (!matchingTask) {
      speak("I could not find that task.");
      return;
    }

    editTask(
      matchingTask.id,
      newName
    );

    speak(
      "I renamed " +
        oldName +
        " to " +
        newName
    );
  }

  function getNextTask() {
    const activeTasks = sortedTasks.filter((task) => !task.done);
    return activeTasks.length > 0 ? activeTasks[0] : null;
  }

  function readTasksAloud() {
    const activeTasks = sortedTasks.filter((task) => !task.done);

    if (activeTasks.length === 0) {
      speak("You have no active tasks.");
      return;
    }

    const taskText = activeTasks
      .map((task, index) => `Task ${index + 1}: ${task.text}`)
      .join(". ");

    speak("Here are your tasks. " + taskText);
  }

  function readDueToday() {
    const today = new Date();

    const dueTodayTasks = sortedTasks.filter((task) => {
      if (!task.dueDate || task.done) return false;

      const dueDate = new Date(task.dueDate);
      return dueDate.toDateString() === today.toDateString();
    });

    if (dueTodayTasks.length === 0) {
      speak("You have no tasks due today.");
      return;
    }

    const taskText = dueTodayTasks
      .map((task) => task.text)
      .join(". ");

    speak("You have " + dueTodayTasks.length + " tasks due today. " + taskText);
  }

  function readOverdueTasks() {
    const now = new Date();

    const overdueTasks = sortedTasks.filter((task) => {
     if (!task.dueDate || task.done) return false;

     const dueDate = getTaskDateTime(task);
     return dueDate < now;
    });

    if (overdueTasks.length === 0) {
      speak("You have no overdue tasks.");
      return;
    }

    const taskText = overdueTasks
     .map((task) => task.text)
     .join(". ");

    speak("You have " + overdueTasks.length + " overdue tasks. " + taskText);
  }

  function clearCompletedTasks() {
    setTasks(tasks.filter((task) => !task.done));
    speak("I cleared all completed tasks.");
  }

  function getPriority(text) {
    const lowerText = text.toLowerCase();

    if (
      lowerText.includes("urgent") ||
      lowerText.includes("important") ||
      lowerText.includes("high priority")
    ) {
      return "high";
    }

    if (
      lowerText.includes("low priority") ||
      lowerText.includes("not urgent")
    ) {
      return "low";
    }

    return "medium";
  }

  function speak(text) {
    const message = new SpeechSynthesisUtterance(text);
    message.lang = "en-IE";
    window.speechSynthesis.speak(message);
  }

  function exportTasks() {
    const data = JSON.stringify(tasks, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "angelos-tasks-backup.json";
    link.click();

    URL.revokeObjectURL(url);
  }

  function importTasks(event) {
    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const importedTasks = JSON.parse(reader.result);

        if (!Array.isArray(importedTasks)) {
          alert("Invalid backup file.");
          return;
        }

        setTasks(importedTasks);
        speak("Tasks imported successfully.");
      } catch {
        alert("Could not import tasks.");
      }
    };

    reader.readAsText(file);
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
      <VoiceButton onVoiceInput={handleVoiceInput} />
      <TaskInput onAddTask={addTask} />
      <button onClick={exportTasks}>
        Export Tasks
      </button>
      <button onClick={clearCompletedTasks}>
        Clear Completed Tasks
      </button>
      <input
        type="file"
        accept="application/json"
        onChange={importTasks}
      />
      <TaskList 
        tasks={sortedTasks} 
        onToggleTask={toggleTask}
        onDeleteTask={deleteTask} 
        onEditTask={editTask}
        getDueStatus={getDueStatus}
        onChangePriority={changePriority}
      />
    </main>
  );
}

export default App;