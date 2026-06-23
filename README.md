# Deployment

The Virtual Queue System application can run as standalone Node.js application or can be built as a docker container. We recommend using docker with docker compose to speed up the deployment.

Recommended (optional):

Create a `.env` file in the project root and set the following variables:
- `JWT_SECRET=[secret]`: A Cryptographically secure pseudorandom hex encoded secret to verify signed Authentication Tokens
- `CSRF_SECRET=[secret]`: A Cryptographically secure pseudorandom hex encoded secret to verify signed CSRF protection cookies

If omitted, they will be generated on application start but not persisted. This means all authentication tokens will become invalid on server restart.
***
# Deploying with Docker

1. Make sure you have Docker and Docker Compose installed on your system
2. Clone the repository at: https://github.com/FH-Clemens/IT-Projektarbeit.git
3. Open a console in the project root directory
4. Run  `docker compose up --build` 

The application listens to port 3000 internally, docker compose maps this port to 3000:3000.
***
# Deploying as Standalone

1. Make sure Node.js is installed on your system: https://nodejs.org/en/download
2. Clone the repository at: https://github.com/FH-Clemens/IT-Projektarbeit.git
3. Open a console in the project root directory
4. Run `npm install`
5. Create a `.env` file in project root and define an absolute path for the SQLite database:
   `DB_PATH='/some/path.db'`
6. Open a console in the project root directory
7. Run `node --env-file=.env app.js`

---
# Configuration

## Location

```
project/data/config.json
```

When deploying with docker, the config will be copied into the persistent volume at `/app/data` internally with the name `app-data`. Use `docker volume inspect {project}_app-data` to find its path on your host system.

## Properties

The following configuration values have to be set:

---
```json
"queue.retain-data-days": [number]
```
Sets the minimum number of days that queue data is kept. Queue data older is marked for deletion.

---
```json
"queue.purge-data-schedule": [cron]
```

A cron schedule for triggering the removal of old queue data. https://en.wikipedia.org/wiki/Cron#Overview

## Example configuration:

```json
{
  "queue.retain-data-days": 1,
  "queue.purge-data-schedule": "0 3 * * 1-7"
}
```

In the example queue data is kept for a minimum of 1 day. The removal task is scheduled to run every day of the week at 3 am.

# Environment Variables
***

```
DB_PATH
``` 

Absolute path to the SQLite database file. If no DB file is found it will be generated automatically.

**Required**

---

```bash
JWT_SECRET
```

Hex string secure random bytes. The JWT secret is used in creating and authenticating stateless authentication tokens.

**Recommended**

---

```bash
CSRF_SECRET
```

Hex string secure random bytes The CSRF secret is used in protecting the front-end from cross site request forgery. 

**Recommended**
