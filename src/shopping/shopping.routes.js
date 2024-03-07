'use strict'

import { Router } from 'express'
import { addProductShopping, createShopping, removeProductShopping } from './shopping.controller.js'
import { roleClient, validateJwt } from '../../middlewares/verifyRole.js'

const api = Router()

api.post('/createShopping', [validateJwt, roleClient], createShopping)
api.put('/addProductShopping/:id', [validateJwt, roleClient], addProductShopping)
api.put('/removeProductShopping/:id', [validateJwt, roleClient], removeProductShopping)

export default api