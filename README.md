# How to launch the API

## MongoDB

MongoDB is required to run the API.  
A docker-compose definition that will launch MongoDB is provided in the `/mongo` directory at the project root.  

Launching MongoDB:
```bash
cd mongo
docker-compose up -d
```

This will also launch a Mongo web GUI on port 8081.  
Open `http://localhost:8081` in your browser to access it.

## API

The API is a NodeJS application.

### Install dependencies

```bash
npm ci
```

### Launch the API

```bash
npm start
```
