/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'


Route.group(() => {
  // API alive check.
  Route.get('/', async () => {
    return {
      status: "alive"
    }
  })

  // -- Groups

  Route.resource("groups", "GroupController")
    .only(["index", "show", "store", "update", "destroy"])

  // -- Threads

  // Don't need the group id for these endpoints
  Route.resource("threads", "ThreadController")
    .only(["index", "show", "update", "destroy"])

  // /groups/:group_id/threads
  Route.resource("groups.threads", "ThreadController")
    .only(["index", "store"])

  // -- Messages

  // /groups/:group_id/threads/:thread_id/messages
  Route.resource("groups.threads.messages", "MessageController")
    .only(["index", "store"])

  // /groups/:group_id/messages
  Route.get("/groups/:group_id/messages", "MessageController.index")

  // /messages
  Route.resource("messages", "MessageController")
    .only(["index", "destroy"])

  // -- Users

  Route.resource("users", "UserController")
    .only(["index", "show", "update", "destroy"])

}).prefix("/api/v1")

// Default handler, matches anything and says there's nothing.
Route.any("*", ({ response }) => {
  response.status(404).json({
    status: "route_not_found"
  })
})

