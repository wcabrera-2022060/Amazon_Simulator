'use strict'

import jwt from 'jsonwebtoken'
import User from '../src/user/user.model.js'

export const validateJwt = async (req, res, next) => {
    try {
        let { token } = req.headers
        if (!token) return res.status(401).send({ message: 'Unauthorized' })
        let { uid } = jwt.verify(token, process.env.SECRET_KEY)
        let user = await User.findOne({ _id: uid }, { password: 0 })
        if (!user) return res.status(404).send({ message: 'User not found - Unauthorized' })
        req.user = user
        next()
    } catch (error) {
        console.error(error)
        return res.status(401).send({ message: 'Invalid or expired token' })
    }
}

export const roleClient = async (req, res, next) => {
    try {
        let { username, role } = req.user
        if (!role || role == 'ADMIN') return res.status(403).send({ message: `You dont have access, you are ADMIN | username ${username}` })
        next()
    } catch (error) {
        console.error(error)
        return res.status(401).send({ message: 'Unauthorized role, you are ADMIN' })
    }
}

export const roleAdmin = async (req, res, next) => {
    try {
        let { username, role } = req.user
        if (!role || role == 'CLIENT') return res.status(403).send({ message: `You dont have access, you are CLIENT | username ${username}` })
        next()
    } catch (error) {
        console.error(error)
        return res.status(401).send({ message: 'Unauthorized role, you are CLIENT' })
    }
}