# Learning Online - EC2 Test Deploy Guide

Huong dan nay mac dinh server la Ubuntu EC2, deploy test, backend Express/TypeScript chay port `3000`, frontend Vite build ra static file va duoc Nginx serve qua HTTPS.

## 1. Chuan bi EC2

Mo Security Group cho EC2:

- `22` de SSH
- `80` de Certbot xac thuc domain
- `443` de chay HTTPS
- `3000` chi can mo neu muon test backend truc tiep, con binh thuong Nginx se proxy vao port nay

SSH vao EC2:

```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

Cap nhat package va cai tool can thiet:

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y git curl nginx mysql-client
```

## 2. Cai Node.js, npm va PM2

Khuyen nghi dung Node.js 22 LTS:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

Cai PM2 de giu backend chay nen:

```bash
sudo npm install -g pm2
pm2 -v
```

## 3. Pull code tu GitHub

Neu repo public:

```bash
cd /home/ubuntu
git clone https://github.com/anhHuyCLC/Learning_Online deploy
cd deploy
```
Lan sau update code:

```bash
cd /home/ubuntu/Learning_Online
git pull
```

## 4. Cau hinh database va test login DB

Lay thong tin MySQL/RDS:

- Host
- User
- Password
- Database name
- Port mac dinh: `3306`

Test ket noi DB tu EC2:

```bash
mysql -h YOUR_DB_HOST -u YOUR_DB_USER -p YOUR_DB_NAME
```

Sau khi vao MySQL shell, chay:

```sql
SELECT DATABASE();
SHOW TABLES;
SELECT id, email, role FROM users LIMIT 5;
```

Neu `SHOW TABLES;` tra ve `Empty set` hoac lenh select users bao `Table 'appdb.users' doesn't exist`, database dang rong. Import schema mau:

Neu co file export tu database local, uu tien import file backup do va khong can chay `init_schema.sql`:

```bash
cd /home/ubuntu/Learning_Online
mysql -h YOUR_DB_HOST -u YOUR_DB_USER -p YOUR_DB_NAME < backend/scripts/backup.sql
```

File `backend/scripts/backup.sql` hien tai co `DROP TABLE`, `CREATE TABLE` va `INSERT INTO`, nen no se tao lai bang va do du lieu local vao database dang chon. Sau khi import xong, kiem tra:

```sql
SHOW TABLES;
SELECT id, email, role FROM users LIMIT 5;
```

Neu khong co file backup local thi moi dung schema mau:

```bash
cd /home/ubuntu/Learning_Online
mysql -h YOUR_DB_HOST -u YOUR_DB_USER -p YOUR_DB_NAME < backend/scripts/init_schema.sql
```

Kiem tra lai:

```bash
mysql -h YOUR_DB_HOST -u YOUR_DB_USER -p YOUR_DB_NAME
```

```sql
SHOW TABLES;
SELECT id, email, role FROM users LIMIT 5;
```

Tai khoan seed de test login:

```text
admin@test.com / 123456
teacher@test.com / 123456
student@test.com / 123456
```

Neu ket noi fail, kiem tra:

- Security Group cua DB co cho EC2 truy cap port `3306` khong
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` co dung khong
- Neu dung RDS, DB public/private subnet va inbound rule da dung chua

## 5. Cau hinh backend `.env`

Tao file env:

```bash
cd /home/ubuntu/Learning_Online/backend
nano .env
```

Noi dung mau:

```env
DB_HOST=YOUR_DB_HOST
DB_USER=YOUR_DB_USER
DB_PASSWORD=YOUR_DB_PASSWORD
DB_NAME=YOUR_DB_NAME
PORT=3000
NODE_ENV=production
JWT_SECRET=test-secret-change-anything
JWT_EXPIRE=7d
SEPAY_WEBHOOK_SECRET=your-sepay-secret
```

Neu test QR nap tien, them cac bien nay:

```env
BANK_ID=970422
ACCOUNT_NO=YOUR_BANK_ACCOUNT
ACCOUNT_NAME=YOUR_ACCOUNT_NAME
```

## 6. Cai thu vien backend va chay backend

Backend hien chay TypeScript truc tiep bang `tsx`, nen can cai day du dependency:

```bash
cd /home/ubuntu/Learning_Online/backend
npm ci
npx tsc --noEmit
```

Chay test backend:

```bash
npx tsx app.ts
```

Neu thay log `Server running on port 3000` la OK. Dung `Ctrl + C`, roi chay bang PM2:

```bash
pm2 start "npx tsx app.ts" --name learning-online-backend
pm2 save
pm2 startup
```

Lenh `pm2 startup` se in ra mot lenh `sudo ...`, copy lenh do chay them mot lan de backend tu khoi dong lai sau khi reboot.

Kiem tra backend:

```bash
curl http://localhost:3000/api/courses
pm2 logs learning-online-backend
```

## 7. Cau hinh frontend `.env` va build

Tao file env frontend:

```bash
cd /home/ubuntu/Learning_Online/frontend
nano .env
```

Neu dung domain:

```env
VITE_API_URL=https://api.your-domain.com
```

Neu frontend va backend chung domain, Nginx proxy `/api` ve backend thi co the de:

```env
VITE_API_URL=https://your-domain.com
```

Khong them `/api` vao `VITE_API_URL`, vi code da tu noi them `/api`.

Cai thu vien va build:

```bash
cd /home/ubuntu/Learning_Online/frontend
npm ci
npm run build
```

Ket qua build nam o:

```text
/home/ubuntu/Learning_Online/frontend/dist
```

## 8. Cau hinh Nginx

Tao file config:

```bash
sudo nano /etc/nginx/sites-available/learning-online
```

Config mau cho chung mot domain:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    root /home/ubuntu/Learning_Online/frontend/dist;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:3000/uploads/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Bat site va test Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/learning-online /etc/nginx/sites-enabled/learning-online
sudo nginx -t
sudo systemctl reload nginx
```

Mo browser test:

```text
http://your-domain.com
```

## 9. Cau hinh SSL certificate

Tro DNS record ve EC2 truoc:

- `A your-domain.com -> YOUR_EC2_PUBLIC_IP`
- `A www.your-domain.com -> YOUR_EC2_PUBLIC_IP`

Cai Certbot:

```bash
sudo apt install -y certbot python3-certbot-nginx
```

Cap cert:

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Test auto renew:

```bash
sudo certbot renew --dry-run
```

Sau khi co cert, frontend nen dung:

```env
VITE_API_URL=https://your-domain.com
```

Neu doi `.env` frontend, phai build lai:

```bash
cd /home/ubuntu/Learning_Online/frontend
npm run build
sudo systemctl reload nginx
```

## 10. Kiem tra login va API sau deploy

Kiem tra frontend:

```text
https://your-domain.com
```

Kiem tra API:

```bash
curl https://your-domain.com/api/courses
```

Test login bang API:

```bash
curl -X POST https://your-domain.com/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"YOUR_EMAIL","password":"YOUR_PASSWORD"}'
```

Neu login fail:

- Kiem tra `JWT_SECRET` backend da co chua
- Kiem tra user/password trong DB
- Kiem tra password trong DB da hash dung format bcrypt chua
- Xem log backend bang `pm2 logs learning-online-backend`

## 11. Deploy update lan sau

Moi lan pull code moi:

```bash
cd /home/ubuntu/Learning_Online
git pull

cd backend
npm ci
npx tsc --noEmit
pm2 restart learning-online-backend

cd ../frontend
npm ci
npm run build
sudo systemctl reload nginx
```

## 12. Cac lenh debug nhanh

Kiem tra backend co chay khong:

```bash
pm2 status
pm2 logs learning-online-backend
curl http://localhost:3000/api/courses
```

Kiem tra Nginx:

```bash
sudo nginx -t
sudo systemctl status nginx
sudo tail -n 100 /var/log/nginx/error.log
```

Kiem tra port:

```bash
sudo ss -tulpn | grep -E ':80|:443|:3000'
```

Kiem tra DB:

```bash
mysql -h YOUR_DB_HOST -u YOUR_DB_USER -p YOUR_DB_NAME
```

Kiem tra file anh upload:

```bash
ls -lah /home/ubuntu/Learning_Online/backend/uploads
curl https://your-domain.com/uploads/courses/react-beginner.jpg
```
