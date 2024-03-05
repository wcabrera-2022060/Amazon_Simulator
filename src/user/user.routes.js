'use strict'

import { Router } from 'express'
import { createUser, deleteUser, getUsers, login, searchUser, updateUser, userToAdmin } from './user.controller.js'
import { roleAdmin, roleClient, validateJwt } from '../../middlewares/verifyRole.js'

const api = Router()

//*Global routes
api.post('/createUser', createUser)
api.post('/login', login)
api.put('/updateUser/:id', [validateJwt], updateUser)
api.delete('/deleteUser/:id', [validateJwt], deleteUser)

//*Admin routes
api.get('/getUsers', [validateJwt, roleAdmin], getUsers)
api.post('/searchUser/:id', [validateJwt, roleAdmin], searchUser)
api.put('/userToAdmin/:id', [validateJwt, roleAdmin], userToAdmin)

export default api