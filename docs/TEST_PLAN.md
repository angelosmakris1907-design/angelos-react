# Angelos Test Plan

## Voice Add Task
- Say: urgent study chemistry tomorrow at 6
- Expected: task added, high priority, due tomorrow, time 6:00

## Relative Reminder
- Say: remind me in 10 minutes to call George
- Expected: task added and appears in Upcoming Soon

## Categories
- Say: create category university
- Say: move chemistry to university
- Say: read my university tasks
- Expected: task is moved and read aloud

## Delete and Undo
- Delete a task manually
- Refresh page
- Click Undo Delete
- Expected: task restored

## Recurring Task
- Say: take medication every day at 9
- Complete it
- Expected: new task created for tomorrow

## Agenda
- Say: read my agenda
- Expected: scheduled tasks are read aloud
