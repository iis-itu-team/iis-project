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
    .middleware({
      "show": "group-auth",
      "store": "require-auth",
      "update": "require-auth",
      "destroy": "require-auth"
    })

  Route.post("/groups/:id/kick", "GroupController.kick")
    .middleware("require-auth")

  // -- Group Requests

  Route.resource("groups.requests", "GroupRequestController")
    .only(["index", "store"])
    .middleware({
      "index": "require-auth",
      "store": "require-auth"
    })
    .paramFor("groups", "group_id")
    .paramFor("requests", "request_id")

  Route.resource("requests", "GroupRequestController")
    .only(["show", "destroy"])
    .middleware({
      "show": "require-auth",
      "destroy": ["require-auth", "admin"]
    })

  Route.put("/requests/:id/status", "GroupRequestController.changeStatus")
    .middleware("require-auth")

  // -- Threads

  // Don't need the group id for these endpoints
  Route.resource("threads", "ThreadController")
    .only(["index", "show", "update", "destroy"])
    .middleware({
      "update": "require-auth",
      "destroy": "require-auth"
    })
    .paramFor("threads", "thread_id")

  // /groups/:group_id/threads
  Route.resource("groups.threads", "ThreadController")
    .only(["index", "store"])
    .middleware({
      "index": "group-auth",
      "store": "require-auth"
    })

  // -- Messages

  // /groups/:group_id/threads/:thread_id/messages
  Route.resource("groups.threads.messages", "MessageController")
    .only(["index", "store"])
    .middleware({
      "index": "group-auth"
      "store": "require-auth"
    })

  // /groups/:group_id/messages
  Route.get("/groups/:group_id/messages", "MessageController.index").middleware("group-auth")

  // /messages
  Route.resource("messages", "MessageController")
    .only(["index", "destroy"]).middleware({
      "destroy": "require-auth"
    })

  // -- Users

  Route.resource("users", "UserController")
    .only(["index", "show", "update", "destroy"]).middleware({
      "*": "require-auth"
    })

  // -- Rate
  Route.post("/rate", "MessageController.rate")

  // -- Login
  Route.post("/auth/login", "AuthController.login")

  // -- Logout
  Route.post("/auth/logout", "AuthController.logout").middleware("require-auth")

  // -- Register
  Route.post("/auth/register", "AuthController.register")

  // -- Me
  Route.get("/auth/me", "AuthController.me").middleware("require-auth")

}).prefix("/api/v1")

// Default handler, matches anything and says there's nothing.
Route.any("*", ({ response }) => {
  response.status(404).json({
    status: "route_not_found"
  })
})

