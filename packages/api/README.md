# Wildlife licencing API

#### For Natural England

The API between the UI and MS Power Apps

### Running Sequelize Database Migrations

To run the migrations ensure the necessary environment variables are set
```
POSTGRES_USER
POSTGRES_PW
POSTGRES_DB
```
These should already be exposed on CI, but locally you will need to set them yourself as so: 
```
export POSTGRES_USER=exampleuser; export POSTGRES_PW=examplepassword; export POSTGRES_DB=exampledb;
```
and then run the following command:

```shell
npm run database:migration:migrate
```

### Creating new Sequelize Database Migrations
You'll notice that there is a migrations folder in same directory as this readme. Each one contains the commands to update the database schema, both up and down. To create a new migration, run the following command:

```shell
npm run database:migration:create
```
This will generate a template file to fill out. The up commands are the ones that will be run when you run the migration, and the down commands are the ones that will be run when you roll back the migration. It uses the queryInterface from Sequelize, whose documentation can be found here: https://sequelize.org/docs/v6/other-topics/query-interface/

Due to the current setup of the project the generated file's extension will need to be changed from `.js` to `.cjs` before the migration can be run. This tells Sequelize to run the file using CommonJS rather than ES6.