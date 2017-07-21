# Node Actions Over Time

## Goal
What I am thinking about is how to set up a message queue that will not only take messages with deadline / dates but also will know how to notify the parent process of the relevant event that has now become executable.

The requirements I have or this task runner is simple. It should store a task name in the database with either a local date or deadline. If a process deadline is close to becoming relevant the task runner should priorotize this task. The task runner need not be a part of the existing application. The date of the task is the date that determines when a task becomes active.

## Inspiration
I appreciate what flux has done with their uni-directional flow of data in an application. I believe that the backend can benifit from such an approach.

### Security considerations
- The process running this task manager should not be writeable by applications that are on the same computer or from the same cluseter or have a certain authorized key to do work on the queue.

### Things to consider
- persistance
- staying organized
- preformance
- Lazy
- can the task runner boot its own processes to be executed
- keep track of task success and failure
- Is a message history important

#### Persistance
When thinking of persistance of state there are a few things we need to consider.
- If the application craches the state should be maintained when the reboot happened
- When the application deploys a new version, it should still contain the logic to handle the request from the message
- Cache should auto populate when application boots for the first time and there are messages in the queue

#### Stay organized
The queue should know what the next event will be at all time. Since events are actions over time we can compare newcomers to the next event and displace the old next event with the newcomer or find the relevant place for the newcomer to be slotted in in the database. On top of running events at certain time stamps process priority need to be considered. For example High would always run next. Medium would always run after hight and Low after Medium. When deadlines are reached a task is bumped to high.

#### Preformance
The task runner should consider how preformant it is being. If it can determine to run two or three tasks without using up the process memory. A single `setInterval` should be used for looping events. The next event date and id should be kept in memory so we can determine if it is next in line.

#### Lazy
Should only run tasks if the machine is not overloaded.

#### Can the task runner boot its own processes to be executed
For now I would say no. It seem like this is an extra feature for future.

#### Keep track of task success and failure
This is a core feature of task runners. You need to be able to keep tasks in the task runner log so that the developer can be notified of issues and the software can retry an action a few times. This should also make a task lower priority if it keeps failing.

#### Is a message history important
A message history can be kept so that tasks can be replayed (hmmmmm, maybe not in a production email server).

### What has already been done?

- Caching of database requests: `memory-cache` on npm
- creating, destroying and managing clusters: `cluster` on npm or nodejs clusters in docs
- a loop that will do checks for next tasks `node-schedule`

### What does the MVP look like?
- Create a task either at the front or the back of the queue
- Track errors on tasks and reschedule them
- Keep track of tasks by date
- report on recurring errors
- cache next task to run
