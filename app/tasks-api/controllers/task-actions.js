const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs-extra')

const Task = require('../models/task');
const { createError } = require('../helpers/error');

const getTasks = async (req, res, next) => {
  let tasks;

  try {
    tasks = await Task.find({ user: req.userId });
  } catch (err) {
    const error = createError('Failed to fetch tasks.', 500);
    return next(error);
  }

  res
    .status(200)
    .json({ tasks: tasks.map((task) => task.toObject({ getters: true })) });
};

const deleteTask = async (req, res, next) => {
  const taskId = req.params.id;
  let task;
  try {
    task = await Task.findOne({ _id: taskId });
  } catch (err) {
    const error = createError('Failed to delete task.', 500);
    return next(error);
  }

  if (task.user.toString() !== req.userId) {
    const error = createError(
      'You are not authorized to delete this task.',
      403
    );
    return next(error);
  }

  try {
    await Task.deleteOne({ _id: taskId });
    const logEntry = `${new Date().toISOString()} User Deleted Task - ${req.userId}\n`;
    await addLog(logEntry);

  } catch (err) {
    const error = createError('Failed to delete task.', 500);
    return next(error);
  }

  res.status(200).json({ message: 'Task deleted!' });
};



const createTask = async (req, res, next) => {
  const title = req.body.title;
  const text = req.body.text;
  const newTask = new Task({
    title,
    text,
    user: new mongoose.Types.ObjectId(req.userId),  // Correct usage with `new`
  });

  let savedTask;

  try {
    savedTask = await newTask.save();
    const logEntry = `${new Date().toISOString()} User Added New Task - ${req.userId}\n`;
    await addLog(logEntry);

  } catch (err) {
    const error = createError('Failed to save task.', 500);
    return next(error);
  }

  res.status(201).json({ task: savedTask.toObject() });
};




const addLog = async (logEntry) => {
  const logsFile = path.join('/app', `${process.env.LOGS_DIR}`, 'tasks-log.txt');
  try {
    await fs.ensureFile(logsFile);
    await fs.appendFile(logsFile, logEntry);
  } catch (err) {
    console.log('Could not add logs to log file at path:', logsFile.toString())
  }
}


const getLogs = async (req, res, next) => {
  const logsFile = path.join('/app', `${process.env.LOGS_DIR}`, 'tasks-log.txt');
  try {
    await fs.ensureFile(logsFile);
    const dataFromFile = await fs.readFile(logsFile);
    const dataArr = dataFromFile.toString().split('\n');
    res.status(200).json({ logs: dataArr });
  } catch (err) {
    console.log('Could not read logs to log file at path:', logsFile.toString())
    createAndThrowError('Could not open logs file.', 500);
  }
};


exports.getTasks = getTasks;
exports.deleteTask = deleteTask;
exports.createTask = createTask;
exports.getLogs = getLogs;
