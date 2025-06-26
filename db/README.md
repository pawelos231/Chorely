# Database Setup

This directory contains the SQL scripts to set up and seed the PostgreSQL database for the Chorely application.

## Running the Database

A `docker-compose.yml` file is provided in the root of the project to easily run a PostgreSQL database with the correct schema and seed data.

### Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop) must be installed and running on your system.

### Instructions

1.  Navigate to the root directory of the project in your terminal.
2.  Run the following command:
    ```bash
    docker-compose up
    ```
3.  The first time you run this, Docker will download the `postgres:13` image.
4.  The database will start, and the `schema.sql` and `seed.sql` scripts will be executed to create the tables and populate them with data.
5.  The database will be available on `localhost:5432`.

### Database Credentials

The default credentials are set in the `docker-compose.yml` file:

-   **User:** `user`
-   **Password:** `password`
-   **Database Name:** `chorely` 