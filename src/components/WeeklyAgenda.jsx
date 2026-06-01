function WeeklyAgenda({ tasks }) {
    const activeTasks = tasks.filter((task) => !task.done && task.dueDate);

    return (
        <section>
            <h2>Weekly Agenda</h2>

            {activeTasks.length === 0 ? (
                <p>No scheduled tasks.</p>
            ) : (
                activeTasks.map((task) => (
                    <p key={task.id}>
                        {new Date(task.dueDate).toLocaleDateString()}{" "}
                        {task.dueTime && task.dueTime + " - "}
                        {task.text}
                    </p>
                ))
            )}
        </section>
    );
}

export default WeeklyAgenda;
