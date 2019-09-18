# Steamatic NIS frontend

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

Below you will find some information on how to perform common tasks.<br>
You can find the most recent version of this guide [here](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

Note, `REACT_APP_API_BASE_URL` is required env variable. 
If you use `npm run mock-server`, set it to `http://localhost:8080`. It is convenient to create .env.local file in the 
root of the app, and put env variables there.

### `npm test`

Launches the test runner in the interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
The app is ready to be deployed!


### `npm run mock-server`

Launches the mock server. You are free to mock any number of endpoints, or graphql responses. 
The rest of requests will be proxied to the dev server.

## Environments

The following live environments are available:

- [Development](http://dev.steamatic.com.au) (`dev` branch)
- [Staging](http://staging.steamatic.com.au) (`staging` branch)

## CI/CD

When you push to the branches associated with the live environments
(see `Environments` section above), the backend application 
will be automatically built, tested and deployed to corresponding
live environment if deployment pipeline will succeed.

All other branches in this repo will be built and tested on shared runners when
you push to them.

### Notes on CI/CD implementation

1. Set up `CI` env variable (any value), and `REACT_APP_API_BASE_URL` variable (e.g `https://api.dev.steamatic.com.au`)
2. `npm ci` - install all dependencies.
3. `npm test` - run all tests
4. `npm run build` - build static assets (output directory - `/build`)
