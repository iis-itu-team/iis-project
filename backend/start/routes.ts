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
      "update": "group-auth",  // needs to check permissions differently, not just visibility
      "destroy": "group-auth"  // needs to check permissions differently, not just visibility
    })

  Route.post("/groups/:id/kick", "GroupController.kick")
    .middleware("require-auth") // permissions handled inside group controller/service

  // -- Group Requests

  Route.resource("groups.requests", "GroupRequestController")
    .only(["index", "store"])
    .middleware({
      "index": "group-auth",  // should be only visible to mod / owner / admin?
      "store": "require-auth"
    })
    .paramFor("groups", "group_id")
    .paramFor("requests", "request_id")

  Route.resource("requests", "GroupRequestController")
    .only(["index", "show", "destroy"])
    .middleware({
      "index": "require-auth", // should be only visible to mod / owner / admin?
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
      "index": "thread-auth",
      "show": "thread-auth",
      "update": "thread-auth", // should check differently (is admin / mod...)
      "destroy": "thread-auth" // should check differently (is admin / mod...)
    })
    .paramFor("threads", "thread_id")

  // /groups/:group_id/threads
  Route.resource("groups.threads", "ThreadController")
    .only(["index", "store"])
    .middleware({
      "index": "group-auth",
      "store": "group-auth"
    })

  // -- Messages

  // /groups/:group_id/threads/:thread_id/messages
  Route.resource("groups.threads.messages", "MessageController")
    .only(["index", "store"])
    .middleware({
      "index": "group-auth",
      "store": "group-auth"
    })

  // /messages/:messageId/ratings
  Route.post("/messages/:message_id/ratings", "MessageController.rate").middleware("rating-auth")

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
      "show": "user-auth",
      "update": "user-auth",
      "destroy": "user-auth",
    })

  // -- User statistics
  Route.get("/users/:user_id/statistics", "UserController.statistics")

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

