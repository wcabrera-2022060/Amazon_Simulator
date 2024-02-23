'use strict'

import { Router } from 'express'
import { createUser, deleteUser, getUsers, login, searchUser, updateUser } from './user.controller.js'
import { roleClient, validateJwt } from '../../middlewares/verifyRole.js'

const api = Router()

//*Funciones públicas, sin token
api.post('/createUser', createUser)
api.post('/login', login)

//*Funciones del cliente
api.put('/updateUser', [validateJwt, roleClient], updateUser)
api.delete('/deleteUser', [validateJwt, roleClient], deleteUser)

export default api