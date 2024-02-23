'use strict'

import { Router } from 'express'
import { createProduct, deleteProduct, getProducts, searchProduct, updateProduct } from './product.controller.js'
import { roleAdmin, validateJwt } from '../../middlewares/verifyRole.js'

const api = Router()

//*Admin routes
api.post('/createProduct', [validateJwt, roleAdmin], createProduct)
api.put('/updateProduct/:id', [validateJwt, roleAdmin], updateProduct)
api.delete('/deleteProduct/:id', [validateJwt, roleAdmin], deleteProduct)

//*Global routes
api.get('/getProducts', [validateJwt], getProducts)
api.post('/searchProduct/:id', [validateJwt], searchProduct)

export default api