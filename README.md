# cs50w-project4-network

1.Connect your repository to your Django Template server on Linode

```
$ user@local: ssh root@0.0.0.0
$ $ user@local: root@0.0.0.0: #secret#
$ root@0-0-0-0.ip.linodeusercontent.com: cd /var/www/DjangoApp
$ root@0-0-0-0.ip.linodeusercontent.com: rm -rf .git
$ root@0-0-0-0.ip.linodeusercontent.com: git init
$ root@0-0-0-0.ip.linodeusercontent.com: git add .
$ root@0-0-0-0.ip.linodeusercontent.com: git commit -m "[short note on what the update is about]"
$ root@0-0-0-0.ip.linodeusercontent.com: git remote add origin https://www.github.com/user/project.git
$ root@0-0-0-0.ip.linodeusercontent.com: git push -u origin main
```

2. Add pre-existing files to your repository via the browser.

3. Update the repository Linode-server-side (n = number, h4sh = hash code):
```
$ root@0-0-0-0.ip.linodeusercontent.com: git pull
Username for 'https://github.com': gituser
Password for 'https://gituser@github.com': #github-personal-access-token#
```
