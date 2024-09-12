#!/bin/bash

# AWS ECR Information
AWS_REGION="ap-southeast-1"
AWS_ACCOUNT_ID="992382688515"
PROFILE="ct-sandbox2"

# Repositories
AUTH_REPO="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/todo-auth"
USERS_REPO="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/todo-users"
TASKS_REPO="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/todo-tasks"
FRONTEND_REPO="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/frontend"

# Log in to ECR
echo "Logging into ECR..."
aws ecr get-login-password --region $AWS_REGION --profile=$PROFILE | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Build, Tag, and Push for Auth
echo "Building, tagging, and pushing auth service..."
docker build -t todo-auth ./app/auth-api
docker tag todo-auth:latest $AUTH_REPO:latest
docker push $AUTH_REPO:latest

# Build, Tag, and Push for Users
echo "Building, tagging, and pushing users service..."
docker build -t todo-users ./app/users-api
docker tag todo-users:latest $USERS_REPO:latest
docker push $USERS_REPO:latest

# Build, Tag, and Push for Tasks
echo "Building, tagging, and pushing tasks service..."
docker build -t todo-tasks ./app/tasks-api
docker tag todo-tasks:latest $TASKS_REPO:latest
docker push $TASKS_REPO:latest

# Build, Tag, and Push for Frontend
echo "Building, tagging, and pushing frontend..."
docker build -t frontend ./app/frontend
docker tag frontend:latest $FRONTEND_REPO:latest
docker push $FRONTEND_REPO:latest

echo "All images have been built, tagged, and pushed successfully."
