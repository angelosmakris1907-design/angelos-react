function TodayDashboard({ tasks, notes, getDueStatus }) {
  const todayTasks = tasks.filter(
    (task) => !task.done && getDueStatus(task) === "Due today"
  );

  const overdueTasks = tasks.filter(
    (task) => !task.done && getDueStatus(task) === "Overdue"
  );

  const recurringTasks = tasks.filter(
    (task) => !task.done && task.repeat
  );

  const nextTask = tasks.find((task) => !task.done);

  return (
    <section>
      <h2>Today Dashboard</h2>

      <p>Tasks due today: {todayTasks.length}</p>
      <p>Overdue tasks: {overdueTasks.length}</p>
      <p>Notes: {notes.length}</p>
      <p>Recurring tasks: {recurringTasks.length}</p>

      <h3>Next task</h3>
      {nextTask ? (
        <p>
          {nextTask.text}
          {nextTask.dueTime && " at " + nextTask.dueTime}
        </p>
      ) : (
        <p>No active tasks.</p>
      )}
    </section>
  );
}

export default TodayDashboard;