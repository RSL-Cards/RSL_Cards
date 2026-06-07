# Vertex AI Setup & Authentication Guide

The RSL Cards platform uses Google Cloud's **Vertex AI** (specifically the `gemini-2.5-pro` model) to power our automated computer-vision card scanning and intelligent narrative generation features.

Because Vertex AI requires secure, project-level authentication, local development requires setting up Google Cloud Application Default Credentials (ADC).

---

## 1. Initial Setup

To allow the backend to communicate with Vertex AI during local development, follow these steps:

### Install Google Cloud CLI
If you haven't already, install the `gcloud` CLI tool on your Mac:
```bash
brew install --cask google-cloud-sdk
```

### Authenticate your Local Machine
You must authenticate your machine so the Node/Bun backend can securely request access tokens. Run the following command:
```bash
gcloud auth application-default login
```
*This will open a browser window. Log in with your authorized Google account that has access to the RSL Cards GCP project.*

### Set the Target Project
Ensure your CLI is pointed at the correct GCP Project ID (e.g. `third-node-498216-h8`):
```bash
gcloud config set project third-node-498216-h8
gcloud auth application-default set-quota-project third-node-498216-h8
```

---

## 2. Troubleshooting Errors

### The `invalid_rapt` / `invalid_grant` Error
If you see the following error in your backend logs when scanning a card:

> `[SCAN-CARD] ❌ Model gemini-2.5-pro failed: {"error":"invalid_grant","error_description":"reauth related error (invalid_rapt)"}`

**Why it happens:**
Google Cloud credentials periodically expire for security reasons. Your local machine's Application Default Credentials have simply expired.

**How to fix it:**
Re-authenticate your CLI by running the login command again:
```bash
gcloud auth application-default login
```
Once the browser confirms your login, the backend will automatically pick up the fresh credentials and card scanning will work again immediately.

---

## 3. Docker Integration

If you are running the backend using the local development Docker stack (`make dev-d` / `docker-compose.dev.yml`), **you do not need to do anything extra**. 

The `docker-compose.dev.yml` file is configured to automatically mount your Mac's local `~/.config/gcloud` directory securely into the backend container:

```yaml
    environment:
      GOOGLE_APPLICATION_CREDENTIALS: /root/.config/gcloud/application_default_credentials.json
    volumes:
      - ~/.config/gcloud/application_default_credentials.json:/root/.config/gcloud/application_default_credentials.json:ro
```

Just run the `gcloud auth` command on your Mac natively, and the Docker container will immediately have access to the credentials.

---

## 4. Environment Variables

Ensure the following variables are present in your `infra/docker/.env.dev` file to point the `ai-narrative` module to the correct GCP project:

```env
VERTEX_AI_PROJECT_ID="third-node-498216-h8"
VERTEX_AI_LOCATION="us-central1"
```
