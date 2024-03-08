'use strict'

import { Router } from 'express'
import { roleAdmin, roleClient, validateJwt } from '../../middlewares/verifyRole.js'
import { createInvoice, updateInvoice } from './invoice.controller.js'

const api = Router()

api.post('/createInvoice', [validateJwt, roleClient], createInvoice)
api.put('/updateInvoice/:id', [validateJwt, roleAdmin], updateInvoice)

export default api