import { useEffect, useState } from "react";
import "./App.css";
import Header from "./components/Header";
import NextTask from "./components/NextTask";
import TaskInput from "./components/TaskInput";
import TaskList from "./components/TaskList";
import VoiceButton from "./components/VoiceButton";
import WeeklyAgenda from "./components/WeeklyAgenda";
import CategoryList from "./components/CategoryList";
import NotesList from "./components/NotesList";

function App() {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem("tasks");
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  const [lastDeletedTask, setLastDeletedTask] = useState(() => {
    const savedDeletedTask = localStorage.getItem("lastDeletedTask");
    return savedDeletedTask ? JSON.parse(savedDeletedTask) : null;
  });

  const [categories, setCategories] = useState(() => {
    const savedCategories = localStorage.getItem("categories");
    return savedCategories ? JSON.parse(savedCategories) : ["general"];
  });

  const [briefingText, setBriefingText] = useState("");

  const [notes, setNotes] = useState(() => {
    const savedNotes = localStorage.getItem("notes");
    return savedNotes ? JSON.parse(savedNotes) : [];
  });

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    const interval = setInterval(() => {
      const reminderTasks = getReminderTasks().filter(
        (task) => !task.reminded
      );

      reminderTasks.forEach((task) => {
        speak("Reminder: " + task.text + " is coming up soon.");
        
        setTasks((currentTasks) =>
          currentTasks.map((currentTask) =>
            currentTask.id === task.id 
              ? { ...currentTask, reminded: true } 
              : currentTask
          )
        );
      });
    }, 60000); 

    return () => clearInterval(interval);
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("categories", JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    const todayKey = new Date().toDateString();
    const lastBriefingDate = localStorage.getItem("lastBriefingDate");

    if (lastBriefingDate !== todayKey && tasks.length > 0) {
      morningBriefing();
      localStorage.setItem("lastBriefingDate", todayKey);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

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

   if (
     dueDate.toDateString() === 
     now.toDateString()
    ) {
     return "Due today";
    }

   if (dueDate < now) {
     return "Overdue";
   }

   

   return "";
  }

  function getRepeat(text) {
    const lowerText = text.toLowerCase();

    if (lowerText.includes("every day") || lowerText.includes("daily")) {
      return "daily";
    }

    if (lowerText.includes("every week") || lowerText.includes("weekly")) {
      return "weekly";
    }

    if (lowerText.includes("every month") || lowerText.includes("monthly")) {
      return "monthly";
    }

    return null;
  }

  function addTask(text) {

    const relativeReminder = getRelativeReminder(text);

    const newTask = {
      id: Date.now(),
      text: cleanTaskText(text),
      done: false,
      dueDate: relativeReminder ? relativeReminder.dueDate : getDueDate(text),
      dueTime: relativeReminder ? relativeReminder.dueTime : getDueTime(text),
      priority: getPriority(text),
      category: detectCustomCategory(text),
      reminded: false,
      repeat: getRepeat(text),
    };

    setTasks([...tasks, newTask]);
    return newTask;
  }

  function addCategory(categoryName) {
    const cleanName = categoryName.toLowerCase().trim();

    if (!cleanName || categories.includes(cleanName)) {
      return;
    }

    setCategories([...categories, cleanName]);
    speak("Category " + cleanName + " created.");
  }

  function addNote(text) {
    const newNote = {
      id: Date.now(),
      text,
      createdAt: new Date().toISOString(),
    };

    setNotes((currentNotes) => [...currentNotes, newNote]);

    speak("Note saved.");
  }

  function toggleTask(id) {
    const taskToToggle = tasks.find((task) => task.id === id);

    if (!taskToToggle) return;

    if (!taskToToggle.done && taskToToggle.repeat) {
      const nextDate = new Date(taskToToggle.dueDate || new Date());

      if (taskToToggle.repeat === "daily") {
        nextDate.setDate(nextDate.getDate() + 1);
      }

      if (taskToToggle.repeat === "weekly") {
        nextDate.setDate(nextDate.getDate() + 7);
      }

      if (taskToToggle.repeat === "monthly") {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }

      const newTask = {
        ...taskToToggle,
        id: Date.now(),
        done: false,
        dueDate: nextDate.toISOString(),
        reminded: false,
      };

      setTasks(
        tasks
          .map((task) =>
            task.id === id ? { ...task, done: true } : task
          )
          .concat(newTask)
      );

      speak("Task completed. I created the next recurring reminder.");
      return;
    }

    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  }


  function deleteTask(id) {
    const taskToDelete = tasks.find((task) => task.id === id);

    if (!taskToDelete) return;

    setLastDeletedTask(taskToDelete);
    localStorage.setItem(
      "lastDeletedTask", 
      JSON.stringify(taskToDelete)
    );
    
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
            category: detectCustomCategory(newText),
            repeat: getRepeat(newText),
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
      .replace(/remind me\s+/gi, "")
      .replace(/tomorrow/gi, "")
      .replace(/today/gi, "")
      .replace(/at \d{1,2}(:\d{2})?/gi, "")
      .replace(/urgent/gi, "")
      .replace(/important/gi, "")
      .replace(/high priority/gi, "")
      .replace(/low priority/gi, "")
      .replace(/not urgent/gi, "")
      .replace(/in \d+ minutes?\s+to\s+/gi, "")
      .replace(/in \d+ hours?\s+to\s+/gi, "")
      .replace(/in \d+ hours?( and \d+ minutes?)?\s+to\s+/gi, "")
      .replace(/every day/gi, "")
      .replace(/daily/gi, "")
      .replace(/every week/gi, "")
      .replace(/weekly/gi, "")
      .replace(/every month/gi, "")
      .replace(/monthly/gi, "")
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

    console.log("Voice input received:", lowerText);

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

    if (lowerText.startsWith("delete category ")) {
      const categoryName = lowerText.replace("delete category ", "").trim();
      deleteCategory(categoryName);
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
     localStorage.removeItem("lastDeletedTask");
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

    if (
      lowerText.includes(
        "what should i do next"
      )
    ) {
      const task =
        getRecommendedTask();

      if (!task) {
        speak(
          "You have no active tasks."
        );
        return;
      }

      speak(
        "I recommend " +
          task.text
      );

      return;
    }

    if (lowerText.includes("study tasks")) {
      readTasksByCategory("study");
      return;
    }

    if (lowerText.includes("health tasks")) {
      readTasksByCategory("health");
      return;
    }

    if (lowerText.includes("shopping tasks")) {
      readTasksByCategory("shopping");
      return;
    }

    if (
      lowerText.includes("plan my day") ||
      lowerText.includes("what is my plan today")
    ) {
      planMyDay();
      return;
    }

    if (
      lowerText.includes("what do i have tomorrow") ||
      lowerText.includes("what is tomorrow's schedule") 
    ) {
      readTomorrowTasks();
      return;
    }

    if (
      lowerText.includes("what repeats") ||
      lowerText.includes("recurring tasks")
    ) {
      readRecurringTasks();
      return;
    }

    if (
      lowerText.includes("read my agenda") ||
      lowerText.includes("what is my agenda") ||
      lowerText.includes("weekly agenda")
    ) {
      readAgenda();
      return;
    }

    if (lowerText.startsWith("create category ")) {
      const categoryName = lowerText.replace("create category ", "").trim();
      addCategory(categoryName);
      return;
    }

    if (
      lowerText.startsWith("read my ") &&
      lowerText.endsWith(" tasks")
    ) {
      const categoryName = lowerText
        .replace("read my ", "")
        .replace(" tasks", "")
        .trim();

      readTasksByCategory(categoryName);
      return;
    } 

    if (
      lowerText.startsWith("move ") &&
      lowerText.includes(" to ")
    ) {
      const parts = lowerText
        .replace("move ", "")
        .split(" to ");

      if (parts.length === 2) {
        moveTaskToCategory(parts[0].trim(), parts[1].trim());
      }

      return;
    }

    if (
      lowerText.includes("help") ||
      lowerText.includes("what can you do")
    ) {
      readHelp();
      return;
    }

    if (
      lowerText.startsWith("note ") ||
      lowerText.startsWith("remember ")
    ) {
      const noteText = text
        .replace(/^note\s+/i, "")
        .replace(/^remember\s+/i, "");

      addNote(noteText);
      return;
    }

    if (
      lowerText.includes("read my notes") ||
      lowerText.includes("what are my notes")
    ) {
      readNotes();
      return;
    }

    if (lowerText.startsWith("search notes for ")) {
      const searchTerm = lowerText.replace("search notes for ", "").trim();
      searchNotes(searchTerm);
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
    localStorage.setItem("lastDeletedTask", JSON.stringify(matchingTask));
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

  function planMyDay() {
    const today = new Date();

    const todayTasks = sortedTasks.filter((task) => {
      if (!task.dueDate || task.done) return false;

      const dueDate = new Date(task.dueDate);
      return dueDate.toDateString() === today.toDateString();
    });

    if (todayTasks.length === 0) {
      speak("You have no tasks due today.");
      return;
    }

    const highPriority = todayTasks.filter((task) => task.priority === "high");
    const otherTasks = todayTasks.filter((task) => task.priority !== "high");

    let message = "Here is your plan for today. ";

    if (highPriority.length > 0) {
      message += "Start with: " + highPriority.map((task) => task.text).join(". ") + ". ";
    }

    if (otherTasks.length > 0) {
      message += "Then do: " + otherTasks.map((task) => task.text).join(". ") + ".";
    }

    speak(message);
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

  function readTomorrowTasks() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tomorrowTasks = tasks.filter((task) => {
      if (!task.dueDate || task.done) return false;

      const dueDate = new Date(task.dueDate);

      return (
        dueDate.toDateString() ===
        tomorrow.toDateString()
      );
    });

    if (tomorrowTasks.length === 0) {
      speak("You have no tasks tomorrow.");
      return;
    }

    const taskText = tomorrowTasks
      .map((task) => task.text)
      .join(". ");

    speak(
      "Tomorrow you have: " + taskText
    );
  }

  function readTasksByCategory(category) {
    const categoryTasks = sortedTasks.filter(
      (task) => task.category === category && !task.done
    );

    if (categoryTasks.length === 0) {
      speak("You have no active " + category + " tasks.");
      return;
    }

    const taskText = categoryTasks
      .map((task) => task.text)
      .join(". ");

    speak("Your " + category + " tasks are: " + taskText);
  }

  function readRecurringTasks() {
    const recurringTasks = sortedTasks.filter(
      (task) => task.repeat && !task.done
    );

    if (recurringTasks.length === 0) {
      speak("You have no recurring tasks.");
      return;
    }

    const taskText = recurringTasks
      .map((task) => `${task.text}, repeating ${task.repeat}`)
      .join(". ");

    speak("Your recurring tasks are: " + taskText);
  }

  function readAgenda() {
    const activeScheduledTasks = sortedTasks.filter(
      (task) => !task.done && task.dueDate
    );

    if (activeScheduledTasks.length === 0) {
      speak("You have no scheduled tasks.");
      return;
    }

    const taskText = activeScheduledTasks
      .map((task) => {
        const date = new Date(task.dueDate).toLocaleDateString();
        const time = task.dueTime ? task.dueTime + " " : "";
        return date + " " + time + task.text;
      })
      .join(". ");

    speak("Here is your agenda. " + taskText);
  }

  function readHelp() {
    speak(
      "I can add tasks, edit tasks, delete tasks, manage categories, read your agenda, tell you what is due today, tomorrow, or overdue, create reminders, and manage recurring tasks."
    );
  }

  function readNotes() {
    if (notes.length === 0) {
      speak("You have no notes.");
      return;
    }

    const noteText = notes
      .map((note) => note.text)
      .join(". ");

    speak("Your notes are: " + noteText);
  }

  function detectCustomCategory(text) {
    const lowerText = text.toLowerCase();

    return categories.find((category) =>
      lowerText.includes(category)
    ) || getCategory(text);
  }

  function searchNotes(searchTerm) {
    const results = notes.filter((note) =>
      note.text.toLowerCase().includes(searchTerm)
    );

    if (results.length === 0) {
      speak("I found no notes about " + searchTerm);
      return;
    }

    const noteText = results.map((note) => note.text).join(". ");
    speak("I found these notes: " + noteText);
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

  function getCategory(text) {
    const lowerText = text.toLowerCase();

    if (lowerText.includes("study") || lowerText.includes("homework")) {
      return "study";
    }

    if (lowerText.includes("doctor") || lowerText.includes("medicine")) {
      return "health";
    }

    if (lowerText.includes("buy") || lowerText.includes("shopping")) {
      return "shopping";
    }

    return "general";
  }

  function getRecommendedTask() {
    const activeTasks = tasks.filter(
      (task) => !task.done
    );

    if (activeTasks.length === 0) {
      return null;
    }

    const priorityScore = {
      high: 3,
      medium: 2,
      low: 1,
    };

    return [...activeTasks].sort((a, b) => {
      if (
        priorityScore[a.priority] !==
        priorityScore[b.priority]
      ) {
        return (
          priorityScore[b.priority] -
          priorityScore[a.priority]
        );
      }

      const dateA =
        getTaskDateTime(a) ||
        new Date(9999, 0, 1);

      const dateB =
        getTaskDateTime(b) ||
        new Date(9999, 0, 1);

      return dateA - dateB;
    })[0];
  }

  function deleteCategory(categoryName) {
    const cleanName = categoryName.toLowerCase().trim();

    if (cleanName === "general") {
      speak("The general category cannot be deleted.");
      return;
    }

    setCategories(categories.filter((category) => category !== cleanName));

    setTasks(
      tasks.map((task) =>
        task.category === cleanName
          ? { ...task, category: "general" }
          : task
      )
    );

    speak("Category " + cleanName + " deleted.");
  }

  function moveTaskToCategory(taskName, categoryName) {
    const cleanCategory = categoryName.toLowerCase().trim();

    if (!categories.includes(cleanCategory)) {
      speak("I could not find the category " + cleanCategory);
      return;
    }

    const matchingTask = tasks.find((task) =>
      task.text.toLowerCase().includes(taskName)
    );

    if (!matchingTask) {
      speak("I could not find that task.");
      return;
    }

    setTasks(
      tasks.map((task) =>
        task.id === matchingTask.id
          ? { ...task, category: cleanCategory }
          : task
      )
    );

    speak("I moved " + matchingTask.text + " to " + cleanCategory);
  }

  function undoDelete() {
      if (!lastDeletedTask) {
        speak("There is no deleted task to restore.");
        return;
      }

      setTasks((currentTasks) => [
        ...currentTasks,
        lastDeletedTask,
      ]);

      setLastDeletedTask(null);
      localStorage.removeItem("lastDeletedTask");

      speak("Task restored.");
  }

  function getReminderTasks() {
    const now = new Date();

    return tasks.filter((task) => {
      if (!task.dueDate || !task.dueTime || task.done) return false;

      const dueDate = getTaskDateTime(task);
      const difference = dueDate.getTime() - now.getTime();

      return difference > 0 && difference <= 15 * 60 * 1000;
    });
  }

  function getRelativeReminder(text) {
    const lowerText = text.toLowerCase();

    const hourMatch = lowerText.match(/(\d+) hours?/);
    const minuteMatch = lowerText.match(/(\d+) minutes?/);

    if (!hourMatch && !minuteMatch) return null;

    const dueDate = new Date();

    if (hourMatch) {
      dueDate.setHours(dueDate.getHours() + Number(hourMatch[1]));
    }

    if (minuteMatch) {
      dueDate.setMinutes(dueDate.getMinutes() + Number(minuteMatch[1]));
    }

    return {
      dueDate: dueDate.toISOString(),
      dueTime: `${dueDate.getHours()}:${String(dueDate.getMinutes()).padStart(2, "0")}`,
    };
  }

  function morningBriefing() {
    const today = new Date();

    const todayTasks = tasks.filter((task) => {
      if (!task.dueDate || task.done) return false;

      return (
        new Date(task.dueDate).toDateString() ===
        today.toDateString()
      );
    });

    if (todayTasks.length === 0) {
      speak("Good morning. You have no tasks due today.");
      setBriefingText(message);
      speak(message);
      return;
    }

    const nextTask = getRecommendedTask();

    let message =
      "Good morning. You have " +
      todayTasks.length +
      " tasks due today.";

    if (nextTask) {
      message += " Your next task is " + nextTask.text;

      if (nextTask.dueTime) {
        message += " at " + nextTask.dueTime;
      }

      message += ".";
    }

    setBriefingText(message);
    speak(message);
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

  const reminderTasks = getReminderTasks();

  return (
    <main className="app">
      <Header />
      {briefingText && (
        <section>
          <h2>Briefing</h2>
          <p>{briefingText}</p>

          <button onClick={() => setBriefingText("")}>
            Clear Briefing
          </button>
        </section>
      )}
      {reminderTasks.length > 0 && (
        <section>
          <h2>Upcoming Soon</h2>

          {reminderTasks.map((task) => (
            <p key={task.id}>{task.text}</p>
          ))}
        </section>
      )}
      <NextTask tasks={tasks} />
      <WeeklyAgenda tasks={sortedTasks} />
      <CategoryList categories={categories} />
      <NotesList notes={notes} />
      <button onClick={morningBriefing}>
        Morning Briefing
      </button>
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
      {lastDeletedTask && (
        <button onClick={undoDelete}>
          Undo Delete
        </button>
      )}
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