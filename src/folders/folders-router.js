const express = require('express')
const xss = require('xss')
const FolderService = require('./folders-service')


const folderRouter = express.Router()
const jsonParser = express.json()

const serializefolder = folder=> ({
id: folder.id,
name: xss(folder.name)
})

folderRouter
.route('/')
.get( (req, res, next) => {
    const knexInstance= req.app.get('db')
    FolderService.getAllFolders(knexInstance)
    .then(folders => {
        res.json(folders.map(serializefolder))
    })
    .catch(next)
})
.post(jsonParser, (req, res, next)=>{
    const {name} = req.body;
    const newFolder  = {name}

    if(!name){
        return res.status(400).json({message:'Name of folder required'})
    }

    FolderService.insertFolder(
        req.app.get('db'), newFolder
    )

    .then(folder => {
        res
        .status(201)
        .json(serializefolder(folder))
    })
    .catch(next)

})
module.exports = folderRouter