'use strict'

import { checkPassword, encrypt } from '../../utils/encrypt.js'
import { generateJwt } from '../../utils/jwt.js'
import { checkDates } from '../../utils/validations.js'
import User from './user.model.js'

export const createUser = async (req, res) => {
    try {
        let data = req.body
        let verifyUsername = await User.findOne({ username: data.username })
        if (verifyUsername) return res.status(400).send({ message: 'Username not available' })
        data.password = await encrypt(data.password)
        data.role = 'CLIENT'
        let user = new User(data)
        await user.save()
        return res.send({ message: 'User created successfully', user })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error creating user' })
    }
}

export const getUsers = async (req, res) => {
    try {
        let users = await User.find({})
        return res.send({ users })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error showing users' })
    }
}

export const searchUser = async (req, res) => {
    try {
        let { username } = req.body
        let user = await User.findOne({ username: username })
        if (!user) return res.status(404).send({ message: 'User not found' })
        return res.send({ user })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error searching user' })
    }
}

export const updateUser = async (req, res) => {
    try {
        let { _id } = req.user
        let data = req.body
        let user = checkDates(data, _id)
        if (!user) return res.status(400).send({ message: 'Have submitted some data that cannot be updated or missing data' })
        let updatedUser = await User.findOneAndUpdate({ _id: _id }, data, { new: true, projection: { password: 0 } })
        if (!updatedUser) return res.status(404).send({ message: 'User not found, not updated' })
        return res.send({ message: 'User updated successfully', updatedUser })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error updating user' })
    }
}

export const deleteUser = async (req, res) => {
    try {
        let { _id } = req.user
        let user = await User.findOneAndDelete({ _id: _id })
        if (!user) return res.status(404).send({ message: 'User not found, not deleted' })
        return res.send({ message: 'Deleted user succesfully', user })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error deleting user' })
    }
}

export const login = async (req, res) => {
    try {
        let { username, password } = req.body
        let user = await User.findOne({ username: username })
        if (user && await checkPassword(password, user.password)) {
            let userInfo = {
                uid: user._id,
                name: user.name,
                surname: user.surname,
                username: user.username,
                role: user.role
            }
            let token = await generateJwt(userInfo)

            return res.send({
                message: `Welcome ${user.name}`,
                userInfo,
                token
            })
        }
        return res.status(404).send({ message: 'Invalid credentials' })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Failed login' })
    }
}