## Mini-project: [Taskeep](https://redev-taskeep.vercel.app/)

A simple todo app based on my Redmi Note 10 Pro default Tasks App that I use frequently. The aim is to emulate the features I like.

## App Features

- **Intuitive:** Create/update/complete tasks with subtasks seamlessly.
- **Draft autosave:** Pick up right where you left even when you forgot to save before exiting.
- **Reminders:** Set reminders, pick from 5 alarm sounds and get desktop notifications.
- **Simple and elegant design:** Elegant glassmorphism design with a beautiful background picture.
- **Local data storage:** Data is saved locally on your browser.

## Installation

1. Clone the repository
   ```
   git clone https://github.com/elysonia/redev-todo-app.git && cd redev-todo-app
   ```
2. Install dependencies
   ```
   yarn
   ```
3. Run development mode
   ```
   yarn dev
   ```
4. Production build
   ```
   yarn build
   ```

## Tech Stack

1. [Next.js with TypeScript](https://nextjs.org/docs/app/getting-started/installation)
2. [Material UI](https://mui.com/material-ui/getting-started/installation/)
3. [Zustand](https://zustand.docs.pmnd.rs/getting-started/introduction)
4. [React Hook Form](https://react-hook-form.com/get-started)

## Assets

### Background Image

[Livia @ Unsplash](https://unsplash.com/photos/a-small-lake-surrounded-by-green-hills-and-yellow-flowers-rpryWTMTcSc)

### Alarm sounds:

- [Dreamscape Alarm Clock](https://pixabay.com/sound-effects/dreamscape-alarm-clock-117680/)
- [Lo-Fi Alarm Clock](https://pixabay.com/sound-effects/lo-fi-alarm-clock-243766/)
- [Morning Joy Alarm Clock](https://pixabay.com/sound-effects/morning-joy-alarm-clock-20961/)
- [Oversimplified Alarm Clock](https://pixabay.com/sound-effects/oversimplified-alarm-clock-113180/)
- [Soft Plucks Alarm Clock](https://pixabay.com/sound-effects/soft-plucks-alarm-clock-120696/)

## TODO

- [ ] Task history
- [ ] Allow users to delete string characters between selectionStart and selectionEnd in input.
- [ ] Notification for alarms that had gone off, by clicking them users can be redirected to the attached task.
- [ ] Alarm queue where the next alarm is autoplayed.
- [ ] Set up testing to prevent regression.
- [ ] Set up CI/CD
- [ ] Use TSDoc to comment on variables and functions
- [ ] Improve accessibility (add aria- )
- [ ] Virtualization and memoization to improve performance on large lists.
