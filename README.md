
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

That's it! You are now set up to manage your Kubernetes cluster with AWS EKS, Fargate, and EFS.

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
