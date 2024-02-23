'use strict'

import { Router } from 'express'
import { createCategory, deleteCategory, getCategories, searchCategory, updateCategory } from './category.controller.js'
import { roleAdmin, validateJwt } from '../../middlewares/verifyRole.js'

const api = Router()

api.post('/createCategory', [validateJwt, roleAdmin], createCategory)
api.put('/updateCategory', [validateJwt, roleAdmin], updateCategory)
api.delete('/deleteCategory', [validateJwt, roleAdmin], deleteCategory)
api.get('/getCategories', [validateJwt, roleAdmin], getCategories)
api.post('/searchCategory', [validateJwt, roleAdmin], searchCategory)

export default api