#!/usr/bin/env node

const request = require('request')
const express = require('express')
const app = express()

const argv = require('yargs')
    .default('l', 3000)
    .nargs('l', 1)
    .alias('l', 'listen')
    .describe('l', 'Listening port')

    .default('s', '127.0.0.1:8080')
    .nargs('s', 1)
    .alias('s', 'service')
    .describe('s', 'Connect to the babble service')

    .help('h')
    .alias('h', 'help')

    .argv;

app.use(express.static('static'))

app.get('/data', (req, res) => {
    request(`http://${argv.service}/graph`, (error, response, body) => {
        if (error != null) {
            return res.send(error)
        }

        res.send(body)
    })
})

app.listen(argv.listen, () => { })
