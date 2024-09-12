# Kubernetes on AWS EKS

## Use AWS Cloudformation to Create VPC
We will create VPC with two public and two private subnets in two availability zones. Based on this [Amazon EKS User Guide - VPC for your Amazon EKS cluster](https://docs.aws.amazon.com/eks/latest/userguide/creating-a-vpc.html)

But since we will add some more resources like small EC2 Instance, so we will modify template a little bit. But to use this template you need to first create a ssh key pair, which you will have to mention in the template parameters.
[eks-public-private-2-subnets.yaml](./k8s/aws-vpc/eks-public-private-2-subnets.yaml)

After this we can apply next template in cloudformation to create some roles. Basically one role is for EKS Cluster and one role is for Fargate Pods:
[eks-iam-roles.yaml](./k8s/aws-vpc/eks-iam-roles.yaml)

---

## Install Kustomize (kubectl) for Linux
Kustomize is a configuration management tool for Kubernetes that allows you to customize and manage YAML files without modifying the original files. It enables you to:

Layered customization: Apply overlays (modifications) to base configurations, like changing environment-specific settings (e.g., dev, prod).
Resource composition: Combine multiple YAML files into a single configuration for deployment.
Patching: Modify or patch specific parts of Kubernetes resources (like labels or container images) without duplicating configuration files.
Declarative management: Define configurations in a declarative way, making it easy to maintain and version control.
Kustomize is natively supported by kubectl, making it a useful tool for managing complex Kubernetes deployments.

```bash
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/
```

### To Test Installation:

```bash
kubectl version --client
```

## Install eksctl (in Linux)
eksctl is a command-line tool used for creating, managing, and deleting Amazon EKS (Elastic Kubernetes Service) clusters. It simplifies the setup of Kubernetes clusters on AWS by automating tasks such as:

Cluster creation: Quickly create EKS clusters with nodes and networking configured.
Node group management: Add or remove node groups (EC2 instances) to your clusters.
Kubernetes version upgrades: Easily upgrade the Kubernetes version of your cluster.
Cluster deletion: Cleanly delete an entire EKS cluster and associated resources.
Configuration with YAML: Manage clusters using YAML files for declarative cluster configurations.
It's a simple and efficient tool for handling most EKS cluster operations.

```bash
curl -s --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin
```

### To Test Installation:

```bash
eksctl version
```

---

## AWS Profile Configuration

First, configure AWS using the following command:

```bash
aws configure --profile=my-sandbox-profile
```

Enter all the values prompted (Access Key, Secret Key, Region, etc.).


### To Test Installation:

```bash
aws s3 ls --profile my-sandbox-profile
```
This command lists the S3 buckets in your account using the my-sandbox-profile. If AWS is configured correctly, it will show the list of S3 buckets or a message indicating you don't have any buckets. If there's an issue with the configuration, you'll see an error message like "Unable to locate credentials."

This helps ensure that your AWS credentials and profile are set up correctly.

---

## Next Step: Updating Kubeconfig for AWS EKS

Run the following command to update the kubeconfig for your EKS cluster. It will setup credentials in your  ~/.kube/config file, so that you can use kubectl command to connect and manage EKS Cluster:

```bash
aws eks --region ap-southeast-1 update-kubeconfig --name my-eks-cluster --profile=my-sandbox-profile
```

If successful, you will see output like this:

```bash
Added new context arn:aws:eks:ap-southeast-1:123456789012:cluster/my-eks-cluster to /home/user/.kube/config
```

---

## Next Step: Create Some Fargate Profiles for running your workloads 

### 1. Create Fargate profile for your default namespace:

```bash
aws eks create-fargate-profile   --cluster-name my-eks-cluster   --fargate-profile-name my-eks-fargate-profile   --pod-execution-role-arn arn:aws:iam::123456789012:role/my-eks-fargate-role   --selectors namespace=default --profile=my-sandbox-profile
```

### Verifying the Fargate Profile

```bash
aws eks describe-fargate-profile --cluster-name my-eks-cluster --fargate-profile-name my-eks-fargate-profile --profile=my-sandbox-profile
```

### 2. Create Fargate profile for your kube-system namespace (This is required by aws to run core services):

```bash
aws eks create-fargate-profile   --cluster-name my-eks-cluster   --fargate-profile-name kube-system-eks-fargate-profile   --pod-execution-role-arn arn:aws:iam::123456789012:role/my-eks-fargate-role   --selectors namespace=kube-system --profile=my-sandbox-profile
```

### Verifying the Fargate Profile

```bash
aws eks describe-fargate-profile --cluster-name ccc --fargate-profile-name kube-system-eks-fargate-profile  --profile=my-sandbox-profile
```


---

## Next Step: Install aws-load-balancer-controller (AWS doesn't do it by default. And we will need to successfully connect our deployed services from outside)
For this you can use following guides on AWS. Just following the instructions.
[aws-load-balancer-controller](https://docs.aws.amazon.com/eks/latest/userguide/aws-load-balancer-controller.html)
[lbc-helm](https://docs.aws.amazon.com/eks/latest/userguide/lbc-helm.html)

I am mentioning steps mentioned in above guides which I have followed:

1. Download Iam Policy file
```bash
curl -O https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.7.2/docs/install/iam_policy.json
```

2. Then create policy:
```bash
aws iam create-policy \
    --policy-name AWSLoadBalancerControllerIAMPolicy \
    --policy-document file://iam_policy.json \
    --profile=my-sandbox-profile
```

3. Then associate Iam OIDC Provider
```bash
eksctl utils associate-iam-oidc-provider \
    --region=ap-southeast-1 \
    --cluster=my-eks-cluster \
    --approve --profile=my-sandbox-profile
```


4. Then create Iam Service Account
```bash
eksctl create iamserviceaccount \
  --cluster=my-eks-cluster \
  --namespace=kube-system \
  --name=aws-load-balancer-controller \
  --role-name AmazonEKSLoadBalancerControllerRole \
  --attach-policy-arn=arn:aws:iam::111122223333:policy/AWSLoadBalancerControllerIAMPolicy \
  --approve
```

To list all service-accounts:
```bash
eksctl  get iamserviceaccount --cluster todo-eks-cluster --profile=my-sandbox-profile
```


5. Now Finally Install Load Balancer:

```bash
helm repo add eks https://aws.github.io/eks-charts
```

```bash
helm repo update eks
```

```bash
 helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=my-eks-cluster \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller \
  --set region=ap-southeast-1 \
  --set vpcId=vpc-123456abcde
```


6. Verify that the controller is installed:
```bash
kubectl get deployment -n kube-system aws-load-balancer-controller
```

7. You can also check the logs of aws-load-balancer-controller by following command, so you can see if anything goes wrong:
```bash
kubectl logs -n kube-system -l app.kubernetes.io/name=aws-load-balancer-controller
```


Now after this step you can apply your deployments, services and ingress.

---

## Using EFS with EKS (AS CSI Persistent Volume)
We can use this Amazon EKS User Guide:
[Store an elastic file system with Amazon EFS](https://github.com/kubernetes-sigs/aws-efs-csi-driver/blob/master/examples/kubernetes/static_provisioning/README.md)

Also we need not to install efs-csi driver for Fargate Pods. It can be found here:
[Amazon EKS on AWS Fargate now supports Amazon EFS file systems](https://aws.amazon.com/about-aws/whats-new/2020/08/amazon-ek-on-aws-fargate-now-supports-amazon-efs-file-systems/)


### **Create an EFS Volume**: Ensure that you create an EFS volume and configure the security group to allow access to your VPC (e.g., `192.168.0.0/16`). Note down the File System ID.


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
Now lets create some ECR Repo, to upload our docker images

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

