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
    
}).prefix("/api/v1")

// Default handler, matches anything and says there's nothing.
Route.any("*", ({ response }) => {
  response.status(404).json({
    status: "route_not_found"
  })
})

