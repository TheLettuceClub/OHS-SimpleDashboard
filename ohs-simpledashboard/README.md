# task

- Have a look at https://tanstack.com/ before getting started on this next task. (looked at, mostly understood)
  - From here use at least "query" and "router". (router done, query installed not used)
- Create a new project using vite with template react-ts (done)
  - Install and configure tailwind and shadcn (done)
  - Configure eslint and prettier on this project (done)
- Create a minimal dashboard
  - this dashboard should have an authentication flow, you can mock this with a fixed user/password (done)
  - Create different pages inside this dashboard that will have some basic crud functionalities, for this use localstorage. (in progress)
  - for the login and localstorage create a service layer that will act as an api, this needs to be promise based and with a small delay to mock an api. (largely done)

todo:
clients are technically done, though I am not at all happy with the amount of TS/ESLint errors in that code.
apply what clients have to jobs, then users. try to write less spaghetti code
figure out why editdialog's non-string fields are fucked
kill typescript
try to get rendering stuff out of API
implement localstorage so it stops refreshing all the damn time (saw a query thing for this in their basic example on GH)
