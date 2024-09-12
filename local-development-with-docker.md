# Local Development With Docker

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
