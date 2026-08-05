# Deployment Automation

## Production Website

- Domain: `siyu0529.com`
- Alternate domain: `www.siyu0529.com`
- Server public IP: `120.53.235.94`
- Server type: Tencent Cloud Lighthouse
- Server OS: Ubuntu
- SSH user: `ubuntu`
- Web root: `/var/www/siyu0529.com`
- Web server: Nginx
- HTTPS: enabled with Certbot / Let's Encrypt

## GitHub Repository

- Repository: `https://github.com/Zhenyu0521/ai-native-operator`
- Production branch: `main`

The local project is connected to this remote as `origin`.

## GitHub Actions Workflows

### Deploy Site

File: `.github/workflows/deploy.yml`

Triggers:

1. Any push to `main`.
2. Manual `workflow_dispatch`.
3. Successful completion of `Update AI Signals`.

Deployment flow:

1. GitHub checks out the repository.
2. The workflow creates an SSH key file from `SSH_PRIVATE_KEY`.
3. It adds the server host key with `ssh-keyscan`.
4. It prepares `/tmp/siyu0529-site` on the server.
5. It uploads repository files to `/tmp/siyu0529-site` with `rsync`.
6. It runs `sudo rsync` on the server to sync files into `/var/www/siyu0529.com`.
7. It runs `sudo chown -R www-data:www-data /var/www/siyu0529.com`.

Excluded from production deploy:

- `.git`
- `.github`
- `.superpowers`
- `ai-startup-screenshots`
- `docs`
- `tests`
- `workspace-hub`

### Update AI Signals

File: `.github/workflows/update-news.yml`

Triggers:

1. Daily at `08:00 Asia/Shanghai`.
2. Manual `workflow_dispatch`.

The workflow runs `scripts/update-news.mjs`, commits changed `data/news.json` and `explore-news.html`, then the successful workflow completion triggers `Deploy site`.

## Required GitHub Secrets

Configure these in:

`GitHub -> Zhenyu0521/ai-native-operator -> Settings -> Secrets and variables -> Actions -> Repository secrets`

Required secrets:

- `SERVER_HOST`: `120.53.235.94`
- `SERVER_USER`: `ubuntu`
- `SERVER_PATH`: `/var/www/siyu0529.com`
- `SSH_PRIVATE_KEY`: the full private key, including:
  - `-----BEGIN OPENSSH PRIVATE KEY-----`
  - all key body lines
  - `-----END OPENSSH PRIVATE KEY-----`

Do not put these values in Variables. They must be Repository secrets.

## SSH Key Setup

The deploy key pair was generated locally and the public key was added to the server user's authorized keys:

Server target file:

`/home/ubuntu/.ssh/authorized_keys`

Local test command:

```bash
ssh -i ~/.ssh/siyu0529_github_actions_v2 ubuntu@120.53.235.94
```

Only the private key content goes into GitHub's `SSH_PRIVATE_KEY` secret. The `.pub` public key stays on the server.

## Server Requirements

The deployment workflow assumes:

1. `ubuntu@120.53.235.94` can SSH into the server with the configured deploy key.
2. The `ubuntu` user can run the required `sudo mkdir`, `sudo apt-get`, `sudo rsync`, and `sudo chown` commands in GitHub Actions.
3. Nginx serves `/var/www/siyu0529.com`.
4. Tencent Cloud Lighthouse firewall allows:
   - TCP `22`
   - TCP `80`
   - TCP `443`

## Troubleshooting Notes

### Secrets appear blank in GitHub

That is normal. GitHub does not show secret values after saving.

If Actions logs show:

```text
env:
  SSH_PRIVATE_KEY:
  SERVER_HOST:
```

then the workflow did not receive those secrets. Recreate them as Repository secrets with exact names.

### Private key leaked

If the private key is exposed in chat, logs, or any public place:

1. Generate a new key pair.
2. Add the new `.pub` key to `/home/ubuntu/.ssh/authorized_keys`.
3. Replace `SSH_PRIVATE_KEY` in GitHub Secrets.
4. Remove the old public key from `authorized_keys`.

### HTTP works but HTTPS times out

For Tencent Cloud Lighthouse, open TCP `443` in the Lighthouse firewall. This is separate from CVM security groups.

### Certbot UnicodeDecodeError

Run Certbot with UTF-8 locale:

```bash
sudo env LANG=C.UTF-8 LC_ALL=C.UTF-8 certbot --nginx \
  -d siyu0529.com \
  -d www.siyu0529.com \
  --email <email> \
  --agree-tos \
  --redirect
```

## Normal Update Workflow

For manual site changes:

```bash
git add .
git commit -m "Update site"
git push origin main
```

After push, check:

`GitHub -> Actions -> Deploy site`

When the run is green, refresh:

`https://siyu0529.com`
