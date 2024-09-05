
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
