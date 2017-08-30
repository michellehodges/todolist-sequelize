// add the ability to edit and delete individual todos.
// Add a button to delete all completed todos.
// Sort your todos by their creation date, newest on top.


const express = require('express');
const mustache = require('mustache-express');
const bodyparser = require('body-parser');
const Sequelize = require('sequelize');

const server = express();

server.engine('mustache', mustache());
server.set('views', './views');
server.set('view engine', 'mustache');
// now we can access req.body from forms!
server.use(bodyparser.urlencoded({ extended: false }));


/***************** TODOS SCHEMA *******************/

const db = new Sequelize('todolist_development', 'mischy', '', {
  dialect: 'postgres',
})

const Todo = db.define('todo', {
  title: Sequelize.STRING,
  completed: Sequelize.BOOLEAN
})

// Sychronize the 'todo' schema with the database, meaning make
// sure all tables exist and have the right fields.

Todo.sync().then(function(){
  console.log('todo model synced');
  // Todo.create({
  //   title: 'Pick up dry cleaning',
  //   completed: false
  // })
})

/***************** END OF SCHEMA *******************/

server.get('/', function (request, response) {
  Todo.findAll().then(function(todos) {
    response.render('index', {
      todos: todos,
    })
  })
})

server.post('/new', function (request, response) {
  Todo.create({
    title: request.body.new,
    completed: false,
  }).then(function(){
    response.redirect('/');
  })
})

server.post('/completed/:todo_id', function (request, response) {
  const id = parseInt(request.params.todo_id);

  Todo.update({ completed: true }, { where: { id: id, }})
    .then(function(){ response.redirect('/')})
});

server.post('/edit/:todo_id', function (request, response) {
  const id = parseInt(request.params.todo_id);

  Todo.update({ title: request.body.editbox }, { where: { id: id, }})
    .then(function(){ response.redirect('/')})
})

server.post('/delete/:todo_id', function (request, response) {
  const id = parseInt(request.params.todo_id);

  Todo.destroy({ where: { id: id, }})
    .then(function(){ response.redirect('/')})
})

server.post('/deleteall', function (request, response) {
  const id = parseInt(request.params.todo_id);

  Todo.destroy({ where: { completed: true, }})
    .then(function(){ response.redirect('/')})
})

server.post('/sort', function (request, response) {
  if (request.body.sort === 'ascending') {
    Todo.findAll({ order: [["createdAt", "ASC"]]})
      .then(function(todos){
        response.render('index', { todos: todos, })
      })
  } else if (request.body.sort === 'descending') {
    Todo.findAll({ order: [["createdAt", "DESC"]]})
      .then(function(todos){
        response.render('index', { todos: todos, })
      })
  }
})


server.listen(3000);
