function WeeklyAgenda({ tasks }) {
     const today = new Date();

     const tomorrow = new Date();
     tomorrow.setDate(today.getDate() + 1);

     const activeTasks = tasks.filter((task) => !task.done && task.dueDate);

     const todayTasks = activeTasks.filter(
         (task) => new Date(task.dueDate).toDateString() === today.toDateString()
     );

     const tomorrowTasks = activeTasks.filter(
         (task) => new Date(task.dueDate).toDateString() === tomorrow.toDateString()
     );

     const laterTasks = activeTasks.filter((task) => {
         const taskDate = new Date(task.dueDate).toDateString();

         return (
             taskDate !== today.toDateString() &&
             taskDate !== tomorrow.toDateString()
         );
     });

     function renderTasks(taskList) {
         if (taskList.length === 0) return <p>None.</p>;

         return taskList.map((task) => (
             <p key={task.id}>
                 {task.dueTime && task.dueTime + " - "}
                 {task.text}
             </p>
         ));
     }

     return (
         <section>
            <details>
                <summary>Weekly Agenda</summary>
                <h2>Weekly Agenda</h2>

                <h3>Today</h3>
                {renderTasks(todayTasks)}

                <h3>Tomorrow</h3>
                {renderTasks(tomorrowTasks)}

                <h3>Later</h3>
                {renderTasks(laterTasks)}
            </details>
         </section>
     );
}

export default WeeklyAgenda;

