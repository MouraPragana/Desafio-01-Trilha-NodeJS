const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const userExists = users.some((user) => user.username === username);
  if (!userExists) {
    return response.status(404).json({ error: "User doesn't exist" });
  }
  request.username = username;
  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;
  const userAlreadyExists = users.some((user) => user.username === username);
  if (userAlreadyExists) {
    return response.status(400).json({ error: "User already exists!" });
  }
  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };
  users.push(newUser);
  return response.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const userTodos = users.find((user) => user.username === username);
  return response.status(200).json(userTodos.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { title, deadline } = request.body;
  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };
  const user = users.find((user) => user.username === username);
  user.todos.push(newTodo);
  return response.status(201).json(newTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const user = users.find((user) => user.username === username);
  const userTodos = user.todos.find((todo) => todo.id === id);
  if (!userTodos) {
    return response.status(404).json({ error: "Todo doesn't exist!" });
  }

  userTodos.title = title;
  userTodos.deadline = deadline;

  return response.status(201).json(userTodos);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;

  const user = users.find((user) => user.username === username);
  const userTodo = user.todos.find((todo) => todo.id === id);

  if (!userTodo) {
    return response.status(404).json({ error: "Todo doesn't exist!" });
  }

  userTodo.done = true;
  return response.status(201).json(userTodo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;

  const user = users.find((user) => user.username === username);
  const userTodo = user.todos.find((todo) => todo.id === id);

  if (!userTodo) {
    return response.status(404).json({ error: "Todo doesn't exist!" });
  }

  user.todos.splice(user.todos.indexOf(userTodo), 1);
  return response.status(204).send();
});

module.exports = app;
