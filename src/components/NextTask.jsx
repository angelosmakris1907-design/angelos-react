function NextTask({ tasks }) {
  const activeTasks = tasks.filter((task) => !task.done);

  const nextTask =
    activeTasks.length > 0
      ? activeTasks[0]
      : null;

  return (
    <section>
      <h2>Next Task</h2>

      {nextTask ? (
        <p>{nextTask.text}</p>
      ) : (
        <p>No active tasks.</p>
      )}
    </section>
  );
}

export default NextTask;
