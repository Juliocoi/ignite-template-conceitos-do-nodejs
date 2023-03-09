const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userSearch = users.find(user => user.username === username);

  if(!userSearch){
    return response.status(404).json({error: "User not found"});
  }

  request.username = userSearch;

  return next();
}

app.post('/users', (request, response) => {
  const {name, username } = request.body;

  const verifyUser = users.some(user => user.username === username);

  if(verifyUser){
    return response.status(400).json({error: "This username is not avaliable."});
  }

  const newUser = {
    id: uuidv4(),
    name: name,
    username: username,
    todos: []
  }

  users.push(newUser);

  response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username }  = request;

  return response.status(200).json(username.todos);

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request;

  if(!username){
    return response.status(404).json({error: "User not found"});
  }
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  username.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const todo = username.todos.find(element => element.id === id);

  if(!todo){
    return response.status(404).json({error: "Task not found."});
  }

  todo.title = title
  todo.deadline = new Date(deadline);
  
  return response.status(200).json(todo);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;

  const todo = username.todos.find(element => element.id === id);

  if(!todo){
    return response.status(404).json({error: "Task not found."});
  }

  todo.done = true;

  return response.status(200).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;

  const todo = username.todos.find(element => element.id === id);

  if(!todo){
    return response.status(404).json({error: "Task not found"});
  }

  username.todos.splice(todo, 1);
  
  return response.status(204).send();
});

module.exports = app;