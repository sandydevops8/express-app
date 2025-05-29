Creata a Cluster in EKS
------
eksctl create cluster --name test-cluster --region us-east-1 --nodegroup-name my-nodes --node-type t3.medium --nodes 2

Check cluster context
----
kubectl config current-context
iam-root-account@test-cluster.us-east-1.eksctl.io


Trigger the github action
----------
name: Sandesh Node JS Express-APP

on:
  push:
    branches:
      - main

jobs:
  say-hello:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x]  # You can also use 16.x or 20.x as needed

    steps:
      - name: Checkout repository code
        uses: actions/checkout@v4

      - name: Get short SHA
        id: vars
        run: echo "GIT_SHA=$(git rev-parse --short HEAD)" >> $GITHUB_ENV

      - name: Show SHA
        run: echo "SHA is $GIT_SHA"

      - name: Set up Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}

      - name: Install dependencies
        run: npm ci  # or `npm install` if you don’t use a lockfile

      #- name: Run tests
      #  run: npm test

      #- name: Build app
      #  run: npm run build

      - name: Log in to DockerHub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Build Docker image
        run: docker build -t ${{ secrets.DOCKERHUB_USERNAME }}/san-express-app:$GIT_SHA .

      - name: Push Docker image into Docker Hub
        run: docker push ${{ secrets.DOCKERHUB_USERNAME }}/san-express-app:$GIT_SHA

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}

      - name: Update kubeconfig
        run: |
          aws eks update-kubeconfig --region $AWS_REGION --name test-cluster

      - name: Deploy to Kubernetes
        env:
          GIT_SHA: ${{ env.GIT_SHA }}
        run: |
          envsubst < Deployment.yaml | kubectl apply -f -
          kubectl apply -f Service.yaml
          #kubectl apply -f ingress.yaml
          #kubectl apply -f ingresclass.yaml


   CHeck the cluster Deployment     
--------

     kubectl get all          
NAME                                   READY   STATUS    RESTARTS   AGE
pod/san-express-app-5cfff947bc-nhbs6   1/1     Running   0          24s
pod/san-express-app-5cfff947bc-xgbnb   1/1     Running   0          24s

NAME                              TYPE           CLUSTER-IP      EXTERNAL-IP                                                               PORT(S)        AGE
service/kubernetes                ClusterIP      10.100.0.1      <none>                                                                    443/TCP        13m
service/san-express-app-service   LoadBalancer   10.100.214.79   a629c1bc5aef7492e97969958017fda2-1916906719.us-east-1.elb.amazonaws.com   80:31108/TCP   23s

NAME                              READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/san-express-app   2/2     2            2           24s

NAME                                         DESIRED   CURRENT   READY   AGE
replicaset.apps/san-express-app-5cfff947bc   2         2         2       24s

Verify the end point
---------
 curl -k a629c1bc5aef7492e97969958017fda2-1916906719.us-east-1.elb.amazonaws.com
