# 个人网站部署与 GitHub Actions 自动部署手册

这份文档记录 `siyu0529.com` 的完整部署流程。目标是：后续任何人接手这个项目，只要照着本文执行，就能把网站部署到腾讯云轻量应用服务器，并配置 GitHub Actions 自动同步。

## 当前生产环境信息

- 生产域名：`siyu0529.com`
- www 域名：`www.siyu0529.com`
- 服务器公网 IP：`120.53.235.94`
- 服务器类型：腾讯云轻量应用服务器 Lighthouse
- 服务器系统：Ubuntu
- SSH 用户名：`ubuntu`
- 网站目录：`/var/www/siyu0529.com`
- Web 服务：Nginx
- HTTPS：已通过 Certbot / Let's Encrypt 开启
- GitHub 仓库：`https://github.com/Zhenyu0521/ai-native-operator`
- 生产分支：`main`

## 整体部署链路

完整链路是：

```text
本地修改网站
-> git commit
-> git push origin main
-> GitHub Actions 自动运行 Deploy site
-> GitHub Actions 通过 SSH 登录腾讯云服务器
-> rsync 上传最新文件到服务器临时目录
-> sudo rsync 同步到 /var/www/siyu0529.com
-> https://siyu0529.com 展示最新页面
```

也就是说，后续更新网站时，不需要手动登录服务器改文件。只要代码进入 GitHub 的 `main` 分支，GitHub Actions 就会自动部署。

## 第一次手动部署服务器

如果服务器已经部署好，可以跳过这一节。

### 1. 登录服务器

在本地终端执行：

```bash
ssh ubuntu@120.53.235.94
```

如果能进入类似下面的命令行，说明登录成功：

```text
ubuntu@VM-xxx:~$
```

### 2. 安装 Nginx 和 Git

在服务器上执行：

```bash
sudo apt update
sudo apt install nginx git -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 3. 拉取网站代码

在服务器上执行：

```bash
cd ~
git clone https://github.com/Zhenyu0521/ai-native-operator.git
```

如果仓库是 private，并且服务器无权限 clone，可以先用 GitHub Actions 部署，不必在服务器手动 clone。

### 4. 创建网站目录并复制文件

在服务器上执行：

```bash
sudo mkdir -p /var/www/siyu0529.com
sudo cp -r ~/ai-native-operator/* /var/www/siyu0529.com/
sudo chown -R www-data:www-data /var/www/siyu0529.com
```

### 5. 配置 Nginx

在服务器上创建配置文件：

```bash
sudo nano /etc/nginx/sites-available/siyu0529.com
```

写入：

```nginx
server {
    listen 80;
    server_name siyu0529.com www.siyu0529.com 120.53.235.94;

    root /var/www/siyu0529.com;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

保存退出：

```text
Ctrl + O
回车
Ctrl + X
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/siyu0529.com /etc/nginx/sites-enabled/siyu0529.com
sudo nginx -t
sudo systemctl reload nginx
```

### 6. 打开轻量应用服务器防火墙

在腾讯云控制台操作：

```text
腾讯云控制台
-> 轻量应用服务器 Lighthouse
-> 服务器
-> 选择 120.53.235.94 对应服务器
-> 防火墙
-> 添加规则
```

需要放行：

```text
SSH    TCP:22   0.0.0.0/0
HTTP   TCP:80   0.0.0.0/0
HTTPS  TCP:443  0.0.0.0/0
```

注意：轻量应用服务器用的是 Lighthouse 防火墙，不是 CVM 安全组。

### 7. 配置域名 DNS

在腾讯云云解析 DNS / DNSPod 中添加：

```text
主机记录：@
记录类型：A
记录值：120.53.235.94
线路类型：默认
状态：启用
```

再添加：

```text
主机记录：www
记录类型：A
记录值：120.53.235.94
线路类型：默认
状态：启用
```

验证解析：

```bash
nslookup siyu0529.com
nslookup www.siyu0529.com
```

正常结果应该包含：

```text
120.53.235.94
```

### 8. 配置 HTTPS

在服务器上执行：

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
```

推荐用 UTF-8 环境运行 Certbot，避免终端编码导致 `UnicodeDecodeError`：

```bash
sudo env LANG=C.UTF-8 LC_ALL=C.UTF-8 certbot --nginx \
  -d siyu0529.com \
  -d www.siyu0529.com \
  --email <你的邮箱> \
  --agree-tos \
  --redirect
```

看到类似下面提示，说明成功：

```text
You have successfully enabled HTTPS on https://siyu0529.com and https://www.siyu0529.com
```

## GitHub Actions 自动部署

这一节是重点。目标是：以后只要 `git push origin main`，GitHub 自动把网站同步到服务器。

## 自动部署需要准备什么

需要准备 4 个东西：

1. GitHub 仓库：`Zhenyu0521/ai-native-operator`
2. 一对 SSH key：GitHub Actions 用私钥，服务器保存公钥
3. GitHub Repository secrets：保存服务器地址、用户、部署目录、私钥
4. GitHub Actions workflow：`.github/workflows/deploy.yml`

## 第一步：生成部署专用 SSH key

在本地电脑执行，不是在服务器执行：

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy-siyu0529" -f ~/.ssh/siyu0529_github_actions
```

一路回车即可。

它会生成两个文件：

```text
~/.ssh/siyu0529_github_actions
~/.ssh/siyu0529_github_actions.pub
```

含义：

```text
siyu0529_github_actions      私钥，放到 GitHub Secret
siyu0529_github_actions.pub  公钥，放到服务器 authorized_keys
```

如果私钥曾经泄露过，重新生成一把新 key，例如：

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy-siyu0529-v2" -f ~/.ssh/siyu0529_github_actions_v2
```

## 第二步：把公钥加入服务器

推荐方式：

```bash
ssh-copy-id -i ~/.ssh/siyu0529_github_actions.pub ubuntu@120.53.235.94
```

如果使用的是 v2 key：

```bash
ssh-copy-id -i ~/.ssh/siyu0529_github_actions_v2.pub ubuntu@120.53.235.94
```

如果 `ssh-copy-id` 不可用，就手动添加。

先在本地电脑查看公钥：

```bash
cat ~/.ssh/siyu0529_github_actions.pub
```

或者：

```bash
cat ~/.ssh/siyu0529_github_actions_v2.pub
```

复制完整一行，格式类似：

```text
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI... github-actions-deploy-siyu0529
```

然后登录服务器：

```bash
ssh ubuntu@120.53.235.94
```

在服务器执行：

```bash
mkdir -p ~/.ssh
nano ~/.ssh/authorized_keys
```

把刚才复制的公钥整行粘到文件最后一行。

保存后执行：

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

## 第三步：测试新 key 是否能登录服务器

在本地电脑执行：

```bash
ssh -i ~/.ssh/siyu0529_github_actions ubuntu@120.53.235.94
```

如果用 v2 key：

```bash
ssh -i ~/.ssh/siyu0529_github_actions_v2 ubuntu@120.53.235.94
```

能进入服务器命令行，就说明 SSH key 配置成功。

## 第四步：确认服务器 sudo 权限

GitHub Actions 部署时需要在服务器执行：

```bash
sudo mkdir
sudo apt-get
sudo rsync
sudo chown
```

所以要确认 `ubuntu` 用户可以无密码 sudo。

登录服务器后执行：

```bash
sudo -n true
```

如果没有任何输出，说明可以无密码 sudo。

如果提示：

```text
sudo: a password is required
```

说明 GitHub Actions 会卡住。这时需要配置免密码 sudo，或者改成不用 sudo 的部署目录。

## 第五步：在 GitHub 添加 Repository secrets

进入 GitHub：

```text
Zhenyu0521/ai-native-operator
-> Settings
-> Secrets and variables
-> Actions
-> Secrets
-> Repository secrets
-> New repository secret
```

一定要放在 `Repository secrets`，不要放在 `Variables`，也不要放在 `Environment secrets`。

需要创建 4 个独立 Secret。

第 1 个：

```text
Name: SERVER_HOST
Secret: 120.53.235.94
```

第 2 个：

```text
Name: SERVER_USER
Secret: ubuntu
```

第 3 个：

```text
Name: SERVER_PATH
Secret: /var/www/siyu0529.com
```

第 4 个：

```text
Name: SSH_PRIVATE_KEY
Secret: <私钥完整内容>
```

查看私钥完整内容：

```bash
cat ~/.ssh/siyu0529_github_actions
```

如果用 v2 key：

```bash
cat ~/.ssh/siyu0529_github_actions_v2
```

`SSH_PRIVATE_KEY` 需要复制完整内容，包括第一行和最后一行：

```text
-----BEGIN OPENSSH PRIVATE KEY-----
中间很多行密钥内容
-----END OPENSSH PRIVATE KEY-----
```

不要复制 `.pub` 文件。`.pub` 是公钥，只放服务器。

不要写成：

```text
SSH_PRIVATE_KEY = -----BEGIN OPENSSH PRIVATE KEY-----
...
```

Secret 的值只填密钥本身，不要加 `SSH_PRIVATE_KEY =`。

## 第六步：添加 GitHub Actions 部署文件

仓库文件路径：

```text
.github/workflows/deploy.yml
```

当前内容：

```yaml
name: Deploy site

on:
  push:
    branches:
      - main
  workflow_dispatch:
  workflow_run:
    workflows:
      - Update AI Signals
    types:
      - completed
    branches:
      - main

concurrency:
  group: production-deploy
  cancel-in-progress: true

jobs:
  deploy:
    if: github.event_name != 'workflow_run' || github.event.workflow_run.conclusion == 'success'
    runs-on: ubuntu-latest

    steps:
      - name: Check out repository
        uses: actions/checkout@v4
        with:
          ref: ${{ github.event_name == 'workflow_run' && github.event.workflow_run.head_sha || github.sha }}

      - name: Set up SSH
        env:
          SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
          SERVER_HOST: ${{ secrets.SERVER_HOST }}
        run: |
          mkdir -p ~/.ssh
          printf '%s\n' "$SSH_PRIVATE_KEY" > ~/.ssh/deploy_key
          chmod 600 ~/.ssh/deploy_key
          ssh-keyscan -H "$SERVER_HOST" >> ~/.ssh/known_hosts

      - name: Prepare server
        env:
          SERVER_HOST: ${{ secrets.SERVER_HOST }}
          SERVER_USER: ${{ secrets.SERVER_USER }}
          SERVER_PATH: ${{ secrets.SERVER_PATH }}
        run: |
          ssh -i ~/.ssh/deploy_key "$SERVER_USER@$SERVER_HOST" \
            "mkdir -p /tmp/siyu0529-site && sudo mkdir -p '$SERVER_PATH' && command -v rsync >/dev/null || (sudo apt-get update && sudo apt-get install -y rsync)"

      - name: Deploy files
        env:
          SERVER_HOST: ${{ secrets.SERVER_HOST }}
          SERVER_USER: ${{ secrets.SERVER_USER }}
          SERVER_PATH: ${{ secrets.SERVER_PATH }}
        run: |
          rsync -az --delete \
            --exclude ".git" \
            --exclude ".github" \
            --exclude ".superpowers" \
            --exclude "ai-startup-screenshots" \
            --exclude "docs" \
            --exclude "tests" \
            --exclude "workspace-hub" \
            -e "ssh -i ~/.ssh/deploy_key" \
            ./ "$SERVER_USER@$SERVER_HOST:/tmp/siyu0529-site/"

          ssh -i ~/.ssh/deploy_key "$SERVER_USER@$SERVER_HOST" \
            "sudo rsync -az --delete /tmp/siyu0529-site/ '$SERVER_PATH'/ && sudo chown -R www-data:www-data '$SERVER_PATH'"
```

## 第七步：提交并推送 workflow

在本地项目根目录执行：

```bash
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Actions deployment"
git push origin main
```

推送后 GitHub 会自动触发部署。

查看路径：

```text
GitHub
-> Zhenyu0521/ai-native-operator
-> Actions
-> Deploy site
```

绿色成功后，刷新：

```text
https://siyu0529.com
```

## 日常更新网站怎么做

以后改网站只需要：

```bash
git add .
git commit -m "Update site"
git push origin main
```

然后去 GitHub Actions 看：

```text
Actions -> Deploy site
```

当运行结果变成绿色，网站就已经同步。

如果浏览器还是旧页面，强制刷新：

```text
Mac: Command + Shift + R
Windows: Ctrl + F5
```

也可以加随机参数：

```text
https://siyu0529.com/?v=1
```

## News 自动更新和部署关系

News 自动更新 workflow：

```text
.github/workflows/update-news.yml
```

运行时间：

```text
每天 08:00 Asia/Shanghai
```

它会运行：

```bash
node scripts/update-news.mjs
```

如果 `data/news.json` 或 `explore-news.html` 有变化，它会自动 commit 并 push。

`Update AI Signals` 成功后，会触发 `Deploy site`。

所以 News 的完整链路是：

```text
每天 08:00
-> Update AI Signals 更新 data/news.json / explore-news.html
-> 自动 commit
-> Deploy site 自动部署
-> https://siyu0529.com 更新 News
```

## 部署排障

### GitHub Secret 看起来是空的

这是正常现象。GitHub 保存 Secret 后不会显示原文。

判断 Secret 有没有被 workflow 读到，要看 Actions 日志。

如果日志显示：

```text
env:
  SSH_PRIVATE_KEY: ***
  SERVER_HOST: ***
```

说明读到了。

如果日志显示：

```text
env:
  SSH_PRIVATE_KEY:
  SERVER_HOST:
```

说明没读到。处理方法：

1. 确认 Secret 建在 `Repository secrets`。
2. 确认不是建在 `Variables`。
3. 确认不是建在 `Environment secrets`。
4. 确认名字完全一致：`SERVER_HOST`、`SERVER_USER`、`SERVER_PATH`、`SSH_PRIVATE_KEY`。
5. 删除后重新创建这 4 个 Secret。

### Set up SSH 步骤失败

常见原因：

```text
SSH_PRIVATE_KEY 或 SERVER_HOST 是空的
私钥复制不完整
复制了 .pub 公钥而不是私钥
私钥第一行或最后一行漏了
```

检查：

```text
SSH_PRIVATE_KEY 必须包含：
-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----
```

### Prepare server 步骤失败

常见原因：

```text
服务器 authorized_keys 没有对应公钥
SERVER_USER 不对
SERVER_HOST 不对
SSH key 和服务器公钥不匹配
ubuntu 用户不能无密码 sudo
```

本地先测试：

```bash
ssh -i ~/.ssh/siyu0529_github_actions_v2 ubuntu@120.53.235.94
```

服务器 sudo 测试：

```bash
sudo -n true
```

### Deploy files 步骤失败

常见原因：

```text
服务器没有 rsync
ubuntu 用户没有 sudo rsync 权限
SERVER_PATH 写错
/tmp/siyu0529-site 权限异常
```

服务器上可以检查：

```bash
command -v rsync
ls -ld /tmp/siyu0529-site
ls -ld /var/www/siyu0529.com
```

### HTTP 可以打开，HTTPS 打不开

如果：

```text
http://siyu0529.com 可以打开
https://siyu0529.com 超时
```

优先检查腾讯云轻量应用服务器防火墙是否放行 TCP `443`。

路径：

```text
腾讯云控制台
-> 轻量应用服务器 Lighthouse
-> 服务器
-> 防火墙
-> 添加 HTTPS / TCP:443
```

服务器上也可以检查 Nginx 是否监听 443：

```bash
sudo ss -tlnp | grep ':443'
```

### HTTP 打不开，但自动跳 HTTPS

如果 `http://siyu0529.com` 自动跳到 `https://siyu0529.com`，这是 Certbot `--redirect` 的正常行为。

如果 HTTPS 正常，HTTP 跳转不是问题。

### Certbot 出现 UnicodeDecodeError

报错类似：

```text
UnicodeDecodeError: 'utf-8' codec can't decode byte ...
```

用 UTF-8 环境重新跑：

```bash
sudo env LANG=C.UTF-8 LC_ALL=C.UTF-8 certbot --nginx \
  -d siyu0529.com \
  -d www.siyu0529.com \
  --email <你的邮箱> \
  --agree-tos \
  --redirect
```

### 私钥泄露怎么办

如果私钥发到了聊天、截图或任何不安全地方：

1. 本地重新生成一把 key。
2. 把新 `.pub` 公钥加入服务器 `/home/ubuntu/.ssh/authorized_keys`。
3. 用新私钥完整内容覆盖 GitHub Secret `SSH_PRIVATE_KEY`。
4. 从服务器 `authorized_keys` 删除旧公钥。

## 当前已完成状态

截至 `2026-08-06`：

- `https://siyu0529.com` 已配置为生产站点。
- `https://www.siyu0529.com` 已配置为 www 访问入口。
- 腾讯云轻量应用服务器已部署 Nginx。
- Certbot HTTPS 已启用。
- GitHub Actions `Deploy site` 已跑通过。
- 后续 push 到 `main` 会自动部署。
- `Update AI Signals` 成功后会触发生产部署。
