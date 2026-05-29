# BharatVerify — GitHub Secrets Setup Guide

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**
and add the following secrets:

| Secret Name              | Description                                      | Example Value                          |
|--------------------------|--------------------------------------------------|----------------------------------------|
| `DOCKER_HUB_USERNAME`    | Your Docker Hub username                         | `darshan123`                           |
| `DOCKER_HUB_TOKEN`       | Docker Hub Access Token (not your password!)     | `dckr_pat_xxxxxxxxxxxx`                |
| `VITE_API_URL`           | Backend URL that the frontend will call          | `https://api.bharatverify.com`         |
| `JWT_SECRET`             | Random secret for signing auth tokens            | `supersecretrandomstring123!`          |
| `EMAIL_HOST`             | SMTP host for sending emails                     | `smtp.gmail.com`                       |
| `EMAIL_PORT`             | SMTP port                                        | `587`                                  |
| `EMAIL_USER`             | Email address used to send emails                | `bharatverify@gmail.com`               |
| `EMAIL_PASSWORD`         | Email app password (NOT your Gmail login!)       | `abcd efgh ijkl mnop`                  |
| `GEMINI_API_KEY`         | Google Gemini AI API key                         | `AIzaSyXXXXXXXXXXXXXX`                |

## Optional — for VPS / SSH Deployment
| Secret Name              | Description                                      |
|--------------------------|--------------------------------------------------|
| `SSH_HOST`               | IP address or domain of your server              |
| `SSH_USER`               | Linux username on the server (e.g. ubuntu)       |
| `SSH_PRIVATE_KEY`        | Your private SSH key (the full .pem content)     |

## How to get a Docker Hub Access Token
1. Log in to https://hub.docker.com
2. Go to Account Settings → Security → New Access Token
3. Give it a name like "github-actions"
4. Copy the token and save it as `DOCKER_HUB_TOKEN`

## How to get a Gemini API Key
1. Go to https://aistudio.google.com/app/apikey
2. Create a new API key
3. Copy it and save it as `GEMINI_API_KEY`
