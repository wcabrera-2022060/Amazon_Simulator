'use strict'

import { Router } from 'express'
import { addProductShopping, createShopping, historyShopping, removeProductShopping, searchHistoryShopping } from './shopping.controller.js'
import { roleAdmin, roleClient, validateJwt } from '../../middlewares/verifyRole.js'

const api = Router()

api.post('/createShopping', [validateJwt, roleClient], createShopping)
api.put('/addProductShopping/:id', [validateJwt, roleClient], addProductShopping)
api.put('/removeProductShopping/:id', [validateJwt, roleClient], removeProductShopping)
api.get('/historyShopping', [validateJwt, roleClient], historyShopping)
api.post('/searchHistoryShopping/:id', [validateJwt, roleAdmin], searchHistoryShopping)

export default api