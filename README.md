# Docker and Docker Compose Guide

This guide provides step-by-step instructions for installing, managing, and using Docker and Docker Compose. It also covers some useful Docker commands and tips for better container management.

## Installation

### 1. Install Docker

Follow the instructions from [DigitalOcean's How to Install Docker on Ubuntu](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-20-04) to install Docker.

Alternatively, you can install Docker manually with the following commands:

```bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"
sudo apt update
apt-cache policy docker-ce
sudo apt install docker-ce
sudo systemctl status docker
```

To add your user to the Docker group (optional for non-root users):

```bash
sudo usermod -aG docker ${USER}
```

### 2. Install Docker Compose

Follow the instructions from [DigitalOcean's How to Install Docker Compose](https://www.digitalocean.com/community/tutorials/how-to-install-docker-compose-on-ubuntu-20-04) to install Docker Compose.

Or manually install Docker Compose with:

```bash
sudo curl -L "https://github.com/docker/compose/releases/download/1.27.4/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version
```

---

## Managing Docker Containers

### 1. List Running Docker Containers:

```bash
docker ps -a
```

### 2. List Docker Images:

```bash
docker images
```

### 3. Build Docker Images:

```bash
docker build --tag=your-image-name .
```

### 4. Tag Docker Images:

```bash
docker tag your-image-name your-dockerhub-username/your-image-name:version-tag
```

### 5. Push Docker Images:

```bash
docker push your-dockerhub-username/your-image-name:version-tag
```

### 6. Get Shell Access to a Running Container:

```bash
docker exec -it <container-id> sh
```

---

## Docker Compose Commands

### 1. Start Docker Compose Services (from default compose file):

```bash
docker-compose up
```

### 2. Start Docker Compose in Detached Mode:

```bash
docker-compose up -d
```

### 3. Build and Start Docker Compose Services:

```bash
docker-compose up --build
```

### 4. Use Different Compose File (e.g., Production):

```bash
docker-compose -f docker-compose-prod.yml up
```

### 5. Rebuild and Force Recreate Containers:

```bash
docker-compose up --build --force-recreate
```

### 6. Stop Docker Compose Services Running in Detached Mode:

```bash
docker-compose stop
```

### 7. View Logs for All Services:

```bash
docker-compose logs --tail=0 --follow
```

### 8. View Logs for a Specific Service:

```bash
docker logs --follow <container-name-or-id>
```

---

## Docker Container Management

### 1. Stop All Running Containers:

```bash
docker stop $(docker ps -a -q)
```

### 2. Remove All Docker Containers:

```bash
docker rm $(docker ps -aq)
```

### 3. Remove a Specific Container:

```bash
docker rm <container-id>
```

### 4. Attach to Running Containers to View Logs:

```bash
docker-compose logs --tail=0 --follow
```

### 5. Copy Files from a Container to the Local Host:

```bash
docker cp <container-id>:/path/to/file /local/path
```

### 6. Inspect Docker Container IP Address:

```bash
docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' <container-id-or-name>
```

---

## Useful Docker Commands

### 1. Watch Logs of a Specific Container:

```bash
docker logs --follow <container-name-or-id>
```

### 2. Recreate Containers:

```bash
docker-compose up --build --force-recreate flask_app
```

### 3. Run a Command Inside a Container:

For example, to see the environment variables for a service:

```bash
docker-compose run <service-name> env
```

### 4. Get the Shell of a Running Container:

```bash
docker exec -it <container-id> sh
```

---

## Portainer for Docker Management UI

If you find it difficult to manage Docker from the console, you can install **Portainer**, a lightweight management UI for Docker:

```bash
docker run -d -p 9080:9000 --restart always -v /var/run/docker.sock:/var/run/docker.sock -v portainer_data:/data portainer/portainer
```

After installation, open your browser and navigate to:

```
http://localhost:9080
```

Log in with the default username `admin` and password `p@ssw0rd`.

---

## Additional Tips

- Use the `docker-compose down` command to stop and remove containers, networks, and volumes created by `docker-compose up`.
- Use `docker-compose ps` to view all running containers associated with a specific Docker Compose setup.
- To clean up unused Docker resources (containers, images, volumes, networks), use:

```bash
docker system prune
```

---


# AWS EKS Setup and Kubernetes Configuration

## Install Kustomize (kubectl) for Linux

```bash
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/
```

### To Test Installation:

```bash
kubectl version --client
```

---

## AWS Configuration

First, configure AWS using the following command:

```bash
aws configure --profile=my-sandbox-profile
```

Enter all the values prompted (Access Key, Secret Key, Region, etc.).

---

## Updating Kubeconfig for AWS EKS

Run the following command to update the kubeconfig for your EKS cluster:

```bash
aws eks --region ap-southeast-1 update-kubeconfig --name my-eks-cluster --profile=my-sandbox-profile
```

If successful, you will see output like this:

```bash
Added new context arn:aws:eks:ap-southeast-1:123456789012:cluster/my-eks-cluster to /home/user/.kube/config
```

---

## Creating a Fargate Profile for Default Namespace

To create a Fargate profile for your default namespace, run the following command:

```bash
aws eks create-fargate-profile   --cluster-name my-eks-cluster   --fargate-profile-name my-eks-fargate-profile   --pod-execution-role-arn arn:aws:iam::123456789012:role/my-eks-fargate-role   --selectors namespace=default --profile=my-sandbox-profile
```

### Verifying the Fargate Profile

```bash
aws eks describe-fargate-profile --cluster-name my-eks-cluster --fargate-profile-name my-eks-fargate-profile --profile=my-sandbox-profile
```

---

## Creating Secrets in Kubernetes

To create secrets in Kubernetes, use the following command:

```bash
kubectl create secret generic app-secrets   --from-literal=TOKEN_KEY='test-token-key'   --from-literal=MONGODB_CONNECTION_URI='mongodb+srv://test-user:test-password@cluster0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
```

Output:

```bash
secret/app-secrets created
```

### To List Secrets:

```bash
kubectl get secrets
```

---

## Using EFS with EKS

1. **Create an EFS Volume**: Ensure that you create an EFS volume and configure the security group to allow access to your VPC (e.g., `192.168.0.0/16`). Note down the File System ID.

### Install the EFS CSI Driver:

```bash
kubectl apply -k "github.com/kubernetes-sigs/aws-efs-csi-driver/deploy/kubernetes/overlays/stable/ecr/?ref=release-2.0"
```

### Create EFS StorageClass:

Create a `efs-storageclass.yaml` file with the following content:

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: efs-sc
provisioner: efs.csi.aws.com
```

Apply the storage class:

```bash
kubectl apply -f efs-storageclass.yaml
```

### To Get a List of Storage Classes:

```bash
kubectl get storageclass
```

---

## Creating a Persistent Volume

Create a `efs-pv.yaml` file with the following content, replacing `<file-system-id>` with your actual EFS File System ID:

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: efs-pv
spec:
  capacity:
    storage: 5Gi
  volumeMode: Filesystem
  accessModes:
    - ReadWriteMany
  persistentVolumeReclaimPolicy: Retain
  storageClassName: efs-sc
  csi:
    driver: efs.csi.aws.com
    volumeHandle: <file-system-id>
```

Apply the Persistent Volume:

```bash
kubectl apply -f efs-pv.yaml
```

### To Get a List of Persistent Volumes:

```bash
kubectl get pv
```

---

## Creating a Persistent Volume Claim

Create a `efs-pvc.yaml` file with the following content:

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: efs-pvc
spec:
  accessModes:
    - ReadWriteMany
  storageClassName: efs-sc
  resources:
    requests:
      storage: 5Gi
```

Apply the Persistent Volume Claim:

```bash
kubectl apply -f efs-pvc.yaml
```

### To Get a List of Persistent Volume Claims:

```bash
kubectl get pvc
```

---



# AWS ECR and Kubernetes Deployment

This guide provides instructions for building a Docker image, pushing it to AWS Elastic Container Registry (ECR), and updating a Kubernetes deployment to use the ECR image.

## Step 1: Create an ECR Repository

Run the following command to create an ECR repository:

```bash
aws ecr create-repository --repository-name todo-tasks --region ap-southeast-1
```

Note down the repository URI, which will look something like:

```
<account-id>.dkr.ecr.ap-southeast-1.amazonaws.com/todo-tasks
```

## Step 2: Authenticate Docker with ECR

Run the following command to authenticate Docker to your ECR repository:

```bash
aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.ap-southeast-1.amazonaws.com
```

## Step 3: Build the Docker Image Locally

In the directory containing your Dockerfile, build the Docker image using the following command:

```bash
docker build -t todo-tasks .
```

## Step 4: Tag the Docker Image for ECR

Tag the Docker image to match the ECR repository URI:

```bash
docker tag todo-tasks:latest <account-id>.dkr.ecr.ap-southeast-1.amazonaws.com/todo-tasks:latest
```

## Step 5: Push the Docker Image to ECR

Push the tagged Docker image to the ECR repository:

```bash
docker push <account-id>.dkr.ecr.ap-southeast-1.amazonaws.com/todo-tasks:latest
```

## Step 6: Update Kubernetes Deployment to Use ECR Image

Once the image is successfully pushed to ECR, update your Kubernetes deployment file to use the ECR image.

Here’s an updated deployment YAML file:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: tasks-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: task
  template:
    metadata:
      labels:
        app: task
    spec:
      containers:
        - name: tasks-api
          image: <account-id>.dkr.ecr.ap-southeast-1.amazonaws.com/todo-tasks:latest
          env:
            - name: MONGODB_CONNECTION_URI
              valueFrom:
                secretKeyRef:
                  name: app-secrets
                  key: MONGODB_CONNECTION_URI
            - name: AUTH_API_ADDRESS
              value: 'auth-service.default:3000'
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "1024Mi"
              cpu: "1000m"
```

Replace `<account-id>` with your actual AWS account ID.

## Step 7: Apply the Updated Kubernetes Deployment

Run the following command to apply the changes to your Kubernetes cluster:

```bash
kubectl apply -f tasks-deployment.yaml
```

## Summary of Commands

1. **Create ECR repository**:
   ```bash
   aws ecr create-repository --repository-name todo-tasks --region ap-southeast-1
   ```

2. **Authenticate Docker with ECR**:
   ```bash
   aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.ap-southeast-1.amazonaws.com
   ```

3. **Build Docker image**:
   ```bash
   docker build -t todo-tasks .
   ```

4. **Tag Docker image**:
   ```bash
   docker tag todo-tasks:latest <account-id>.dkr.ecr.ap-southeast-1.amazonaws.com/todo-tasks:latest
   ```

5. **Push Docker image to ECR**:
   ```bash
   docker push <account-id>.dkr.ecr.ap-southeast-1.amazonaws.com/todo-tasks:latest
   ```

6. **Apply Kubernetes deployment**:
   ```bash
   kubectl apply -f tasks-deployment.yaml
   ```




---

## Basic Commands

Here is a list of basic commands that are useful for managing Kubernetes on EKS:

### Get All Services:
```bash
kubectl get services
```

### View Details of a Specific Service:
```bash
kubectl describe service <service-name>
```

### Get All Pods:
```bash
kubectl get pods
```

### View Details of a Specific Pod:
```bash
kubectl describe pod <pod-name>
```

### View Pod Logs:
```bash
kubectl logs <pod-name>
```

### Get All Deployments:
```bash
kubectl get deployments
```

### View Details of a Specific Deployment:
```bash
kubectl describe deployment <deployment-name>
```

### Get All Namespaces:
```bash
kubectl get namespaces
```

### Switch Context to a Different Namespace:
```bash
kubectl config set-context --current --namespace=<namespace-name>
```

### Get All Nodes:
```bash
kubectl get nodes
```

### Get Cluster Information:
```bash
kubectl cluster-info
```

### Apply a YAML File:
```bash
kubectl apply -f <file-name>.yaml
```

### Delete a Resource:
```bash
kubectl delete <resource-type> <resource-name>
```


### Restart / Rollout Deployment:
```bash
 kubectl rollout restart deployment <deployment-name> -n default
 ```

### To Create Secret
```bash
kubectl create secret generic app-secrets \
  --from-literal=username=admin \
  --from-literal=password=new-password
```

