'use strict'

import { Router } from 'express'
import {
    createProduct, deleteProduct, getProducts, productsByCategory, productsMostSold,
    productsOutOfStock, searchProduct, updateProduct
} from './product.controller.js'
import { roleAdmin, validateJwt } from '../../middlewares/verifyRole.js'

const api = Router()

//*Admin routes
api.post('/createProduct', [validateJwt, roleAdmin], createProduct)
api.put('/updateProduct/:id', [validateJwt, roleAdmin], updateProduct)
api.delete('/deleteProduct/:id', [validateJwt, roleAdmin], deleteProduct)
api.get('/productsOutOfStock', [validateJwt, roleAdmin], productsOutOfStock)

//*Global routes
api.get('/getProducts', [validateJwt], getProducts)
api.post('/searchProduct', [validateJwt], searchProduct)
api.get('/productsMostSold', [validateJwt], productsMostSold)
api.post('/productsByCategory/:id', [validateJwt], productsByCategory)

export default api