'use strict'

import { Router } from 'express'
import { createUser, deleteUser, deleteUsers, getUsers, login, searchUser, updatePassword, updateUser, updateUsers, userToAdmin } from './user.controller.js'
import { roleAdmin, roleClient, validateJwt } from '../../middlewares/verifyRole.js'

const api = Router()

//*Global routes
api.post('/createUser', createUser)
api.post('/login', login)
api.put('/updateUser/:id', [validateJwt], updateUser)
api.delete('/deleteUser/:id', [validateJwt], deleteUser)
api.put('/updatePassword/:id', [validateJwt], updatePassword)

//*Admin routes
api.get('/getUsers', [validateJwt, roleAdmin], getUsers)
api.post('/searchUser/:id', [validateJwt, roleAdmin], searchUser)
api.put('/userToAdmin/:id', [validateJwt, roleAdmin], userToAdmin)
api.put('/updateUsers/:id', [validateJwt, roleAdmin], updateUsers)
api.delete('/deleteUsers/:id', [validateJwt, roleAdmin], deleteUsers)

export default api