# API

All API urls are prefixed with `/api/vN`, where `N` is the version of the API. Current value is `1` and will most likely never change.

An URL to access groups (`/groups`) would then look like: `/api/v1/groups` (`http://localhost:9001/api/v1/groups` with host and port).

JSON responses always follow a [common format](https://gist.github.com/Wertik/d4c6c138305672876751ce44e9ae3e63).

A successful call to `GET /groups` with `Data` of [Group](#group) would then return:
```json
{
    "status": "success",
    "data": {
        "id": "group_xxx",
        "title": "My Group",
        [...]
    }
}
```

## Models

### Visibility
`private`, `protected`, `public`

### Role
`admin`, `user`

### Group

| Property | Type | Note |
| -- | -- | -- |
| `id` | string | |
| `title` | string | |
| `visibility` | [Visibility](#visibility) | |
| `created_at` | DateTime | |
| `updated_at` | DateTime | |

### User

| Property | Type | Note |
| -- | -- | -- |
| `id` | string | |
| `nickname` | string | |
| `role` | [Role](#role) | |
| `created_at` | DateTime | |
| `updated_at` | DateTime | |

## Endpoints

#### API alive?

`GET` `/`

> HTTP status codes

| Code | Data | Meaning |
| -- | -- | -- |
| 200 | - | Returned groups |

> JSON `status`

| Value | Meaning |
| -- | -- |
| `alive` | API alive |

### Groups

#### Get groups

`GET` `/groups`

> HTTP status codes

| Code | Data | Meaning |
| -- | -- | -- |
| 200 | [Group](#group)[] | Returned groups |

#### Get group

`GET` `/groups/:groupId`

> URL params

| Parameter | Type | Meaning |
| -- | -- | -- |
| `:groupId` | string | Group id. |

> HTTP status codes

| Code | Data | Meaning |
| -- | -- | -- |
| 200 | [Group](#group) | Returned the group |
| 404 | - | Group not found |

> JSON `status`

| Value | Meaning |
| -- | -- |
| `not_found` | Group not found |

#### Create a group

`POST` `/groups`

> JSON Body

| Property | Type | Note | 
| -- | -- | -- |
| `title` | string | |
| `visibility` | [Visibility](#visibility) | |

> HTTP status codes

| Code | Data | Meaning |
| -- | -- | -- |
| 201 | [Group](#group) | Created the group |

#### Update a group

`PUT` `/groups/:groupId`

> URL params

| Parameter | Type | Meaning |
| -- | -- | -- |
| `:groupId` | string | Group id. |

> JSON Body

| Property | Type | Note | 
| -- | -- | -- |
| `title` | string | |
| `visibility` | [Visibility](#visibility) | |

> HTTP status codes

| Code | Data | Meaning |
| -- | -- | -- |
| 200 | [Group](#group) | Updated the group |

> JSON `status`

| Value | Meaning |
| -- | -- |
| `not_found` | Group not found |

#### Delete a group

`DELETE` `/groups/:groupId`

> URL params

| Parameter | Type | Meaning |
| -- | -- | -- |
| `:groupId` | string | Group id. |

> HTTP status codes

| Code | Data | Meaning |
| -- | -- | -- |
| 200 | [Group](#group) | Deleted the group |

> JSON `status`

| Value | Meaning |
| -- | -- |
| `not_found` | Group not found |

### Users

#### Get users

`GET` `/users`

> HTTP status codes

| Code | Data | Meaning |
| -- | -- | -- |
| 200 | [User](#user)[] | Returned users |

#### Get user

`GET` `/users/:userId`

> URL params

| Parameter | Type | Meaning |
| -- | -- | -- |
| `:userId` | string | User id. |

> HTTP status codes

| Code | Data | Meaning |
| -- | -- | -- |
| 200 | [User](#user) | Returned the user |
| 404 | - | User not found |

> JSON `status`

| Value | Meaning |
| -- | -- |
| `not_found` | User not found |

#### Update a user

`PUT` `/users/:userId`

> URL params

| Parameter | Type | Meaning |
| -- | -- | -- |
| `:userId` | string | User id. |

> JSON Body

| Property | Type | Note | 
| -- | -- | -- |
| `nickname` | string | |
| `role` | [Role](#role) | |

> HTTP status codes

| Code | Data | Meaning |
| -- | -- | -- |
| 200 | [User](#user) | Updated the user |

> JSON `status`

| Value | Meaning |
| -- | -- |
| `not_found` | User not found |

#### Delete a user

`DELETE` `/users/:userId`

> URL params

| Parameter | Type | Meaning |
| -- | -- | -- |
| `:userId` | string | User id. |

> HTTP status codes

| Code | Data | Meaning |
| -- | -- | -- |
| 200 | [User](#user) | Deleted the user |

> JSON `status`

| Value | Meaning |
| -- | -- |
| `not_found` | User not found |
