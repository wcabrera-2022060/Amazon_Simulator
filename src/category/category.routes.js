'use strict'

import { Router } from 'express'
import { createCategory, deleteCategory, getCategories, searchCategory, updateCategory } from './category.controller.js'
import { roleAdmin, validateJwt } from '../../middlewares/verifyRole.js'

const api = Router()

//*Admin routes
api.post('/createCategory', [validateJwt, roleAdmin], createCategory)
api.put('/updateCategory/:id', [validateJwt, roleAdmin], updateCategory)
api.delete('/deleteCategory/:id', [validateJwt, roleAdmin], deleteCategory)

//*Global routes
api.get('/getCategories', [validateJwt], getCategories)
api.post('/searchCategory/:id', [validateJwt], searchCategory)

export default api