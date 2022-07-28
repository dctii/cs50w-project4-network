# cs50w-project4-network

1.Connect your repository to your Django Template server on Linode

```
ssh root@0.0.0.0
root@0.0.0.0: #secret#
cd /var/www/DjangoApp
rm -rf .git
git init
git add .
git commit -m "[short note on what the update is about]"
git remote add origin https://www.github.com/user/project.git
git push -u origin main
```

2. Add pre-existing files to your repository via the browser.

3. Update the repository Linode-server-side.
