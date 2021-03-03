const express = require('express')
const xss = require('xss')
const NotesService = require('./notes-service')

const notesRouter = express.Router()
const jsonParser = express.json()

//for POST
const serializeNote = note=> ({
    id: note.id,
    name: xss(note.name),
    modified: note.modified,
    folderid: xss(note.folderid),
    content: xss(note.content)
})

// for GET
const serializeResponse = note=> ({
    id: note.id,
    name: xss(note.name),
    modified: note.modified,
    folderid: note.folderid,
    content: xss(note.content)
})

notesRouter
.route('/')
.get((req, res, next) =>{
    const knexInstance = req.app.get('db')
    NotesService.getAllNotes(knexInstance)
        .then(notes =>{
            res.json(notes.map(serializeResponse))
        })
        .catch(next)
})
.post(jsonParser, (req, res, next) =>{
    const {name, modified, folderId, content} = req.body;
    const newNote = {name, modified, folderid:folderId, content}

    if(!name){ 
        return res
                .status(400)
                .json({message: "Missing 'name' in request body"})
    }


    if(!content){
        return res  
            .status(400)
            .json({message: "Missing 'content' in request body"})
    }

    if(!folderId){
        return res
                .status(400)
                .json ({message: "Missing 'folderid' in request body"})
    }

    NotesService.insertNotes(
        req.app.get('db'), newNote
    )
        .then(note =>{
            res 
                .status(201)
                .json(serializeNote(note))
        })
        .catch(next)
})

notesRouter
.route('/:note_id')
.all((req, res, next) =>{
    NotesService.getById(
        req.app.get('db'),
        req.params.note_id
    )
    .then(note => {
        if (!note) {
          return res.status(404).json(
            { message: `note doesn't exist` }
          )
        }
        res.note = note
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeNote(res.note))
  })
  .delete((req, res, next) => {
    NotesService.deleteNotes(
      req.app.get('db'),
      req.params.note_id
    )
    
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  
})


module.exports = notesRouter