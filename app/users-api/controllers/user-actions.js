const path = require('path');
const fs = require('fs-extra')

const axios = require('axios');
const { createAndThrowError, createError } = require('../helpers/error');

const User = require('../models/user');

const validateCredentials = (email, password) => {
  if (
    !email ||
    email.trim().length === 0 ||
    !email.includes('@') ||
    !password ||
    password.trim().length < 7
  ) {
    createAndThrowError('Invalid email or password.', 422);
  }
};

const checkUserExistence = async (email) => {
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    createAndThrowError('Failed to create user.', 500);
  }

  if (existingUser) {
    createAndThrowError('Failed to create user.', 422);
  }
};

const getHashedPassword = async (password) => {
  try {
    const response = await axios.get(
      `http://${process.env.AUTH_API_ADDRESS}/hashed-pw/${password}`
    );
    return response.data.hashed;
  } catch (err) {
    const code = (err.response && err.response.status) || 500;
    createAndThrowError(err.message || 'Failed to create user.', code);
  }
};

const getTokenForUser = async (password, hashedPassword, uid) => {
  try {
    const response = await axios.post(
      `http://${process.env.AUTH_API_ADDRESS}/token`,
      {
        password: password,
        hashedPassword: hashedPassword,
        userId: uid
      }
    );
    return { 
        token: response.data.token ,
        refreshToken: response.data.refreshToken,
      };
  } catch (err) {
    const code = (err.response && err.response.status) || 500;
    createAndThrowError(err.message || 'Failed to verify user.', code);
  }
};

const createUser = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    validateCredentials(email, password);
  } catch (err) {
    return next(err);
  }

  try {
    await checkUserExistence(email);
  } catch (err) {
    return next(err);
  }

  let hashedPassword;
  try {
    hashedPassword = await getHashedPassword(password);
  } catch (err) {
    return next(err);
  }

  console.log(hashedPassword);

  const newUser = new User({
    email: email,
    password: hashedPassword,
  });

  let savedUser;
  try {
    savedUser = await newUser.save();
  } catch (err) {
    const error = createError(err.message || 'Failed to create user.', 500);
    return next(error);
  }

  const logEntry = `${new Date().toISOString()} User Created - ${savedUser.id} - ${email}\n`;
  await addLog(logEntry);

  res
    .status(201)
    .json({ message: 'User created.', user: savedUser.toObject() });
};

const verifyUser = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    validateCredentials(email, password);
  } catch (err) {
    return next(err);
  }

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = createError(
      err.message || 'Failed to find and verify user.',
      500
    );
    return next(error);
  }

  if (!existingUser) {
    const error = createError(
      'Failed to find and verify user for provided credentials.',
      422
    );
    return next(error);
  }

  try {
    console.log(password, existingUser);
    const tokenData = await getTokenForUser(
      password,
      existingUser.password,
      existingUser.id
    );

    const logEntry = `${new Date().toISOString()} User Logged In - ${existingUser.id} - ${email}\n`;
    await addLog(logEntry);

    res.status(200).json({ token: tokenData.token, refreshToken: tokenData.refreshToken, userId: existingUser.id });
  } catch (err) {
    next(err);
  }
};


const addLog = async (logEntry) => {
  const logsFile = path.join('/app', `${process.env.LOGS_DIR}`, 'users-log.txt');
  try {
    await fs.ensureFile(logsFile);
    await fs.appendFile(logsFile, logEntry);
  } catch (err) {
    console.log('Could not add logs to log file at path:', logsFile.toString())
  }
}


const getLogs = async (req, res, next) => {
  const logsFile = path.join('/app', `${process.env.LOGS_DIR}`, 'users-log.txt');
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

exports.createUser = createUser;
exports.verifyUser = verifyUser;
exports.getLogs = getLogs;
