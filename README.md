# OUR COMPANY Inspector Scheduler - Laravel 11 (API) + Postgres + Swagger

### Admin demo user
Password: `Password123!`
- `admin@company.test` (role=ADMIN)
  
## Demo users (seeded)
Password for all: `Password123!`
- `uk.inspector@company.test` (UK / Europe/London)
- `mx.inspector@company.test` (MEXICO / America/Mexico_City)
- `in.inspector@company.test` (INDIA / Asia/Kolkata)
  
Admin Dashboard
<img width="1656" height="815" alt="image" src="https://github.com/user-attachments/assets/17a68b1b-56d5-43ac-8315-eb3d10e16edc" />
<img width="1647" height="718" alt="image" src="https://github.com/user-attachments/assets/10013736-3be6-4528-bec0-841858b82483" />
<img width="1652" height="808" alt="image" src="https://github.com/user-attachments/assets/ceff7f33-6eb2-4b57-bdf5-639e40feaee2" />
<img width="1650" height="825" alt="image" src="https://github.com/user-attachments/assets/0dfa41ca-faea-4e13-b9aa-80b3c1aa8bfc" />
<img width="1644" height="992" alt="image" src="https://github.com/user-attachments/assets/200c65f3-c402-4843-b831-29cab2ef812a" />
<img width="1652" height="1053" alt="image" src="https://github.com/user-attachments/assets/30568550-c254-43cb-ad5a-f86e818429b1" />
<img width="1647" height="705" alt="image" src="https://github.com/user-attachments/assets/106d681d-3cba-4615-9695-4c06a3386b6a" />
<img width="1653" height="904" alt="image" src="https://github.com/user-attachments/assets/9e4432dd-d8f3-496b-9304-e17b2ccf80ca" />
User Dashboard
<img width="1648" height="679" alt="image" src="https://github.com/user-attachments/assets/719354ea-65b7-465d-ad7f-8f750ce29bc9" />
<img width="1648" height="730" alt="image" src="https://github.com/user-attachments/assets/9b227387-3257-4e4b-bf05-89947c439471" />
<img width="1649" height="946" alt="image" src="https://github.com/user-attachments/assets/81d581d3-ed47-40b7-9c37-67d6d001247e" />
<img width="1646" height="1030" alt="image" src="https://github.com/user-attachments/assets/7da564d5-aa9e-4c08-935c-5d59391a361c" />
<img width="1647" height="823" alt="image" src="https://github.com/user-attachments/assets/5335b44c-8012-4e76-9134-80dcb39c1988" />
This is a **template/overlay** meant to be copied into a fresh Laravel 11 project.
It includes: **thin controllers**, **service layer**, **FormRequests**, **API Resources**, **status workflow**, **timezone handling (UK/Mexico/India)**, **concurrency-safe claim**, and **Swagger UI**.

## Quick start (recommended)

1) Create Laravel 11 project:
```bash
composer create-project laravel/laravel inspector-scheduler-api "11.*"
cd inspector-scheduler-api
```

2) Install packages:
```bash
composer require laravel/sanctum
composer require darkaonline/l5-swagger
```

3) Publish Sanctum & Swagger config:
```bash
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan vendor:publish --provider="L5Swagger\L5SwaggerServiceProvider"
php artisan migrate
```

4) Copy this template files **over** your project root.
- Copy everything from `backend-template/` into your Laravel project folder.
- If a file already exists, merge carefully (notably: `routes/api.php`, `app/Exceptions/Handler.php`, and `config/l5-swagger.php` if you want customization).

5) Configure Postgres in `.env`:
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=inspector_scheduler
DB_USERNAME=postgres
DB_PASSWORD=postgres
```

6) Run migrations & seed demo data:
```bash
php artisan migrate
php artisan db:seed
```

7) Serve API:
```bash
php artisan serve
```

8) Swagger UI:
- Open: `http://127.0.0.1:8000/api/documentation`


## Key endpoints
- `POST /api/v1/auth/login`
- `GET  /api/v1/jobs?status=OFFERED`
- `POST /api/v1/jobs/{job}/claim`
- `PATCH /api/v1/jobs/{job}/schedule`
- `POST /api/v1/jobs/{job}/complete`
- `GET  /api/v1/my/jobs`

## Notes 
- Dates are stored in DB in UTC (`scheduled_at_utc`, `completed_at_utc`), but responses also include `*_local` based on the authenticated inspector timezone.
- Double claim is prevented by:
  - DB unique constraint on `job_assignments.job_id`
  - Claim performed inside a DB transaction, conflicts return HTTP 409.


## Admin module (optional but recommended for presentation)

This overlay now includes an **Admin area** with:
- Inspectors CRUD (create/edit/deactivate)
- Jobs CRUD (create/edit + **soft delete via archive**)
- Dashboard metrics (pipeline + inspectors by location)
- Inspector job history



### Middleware alias required (Laravel 11)

Add the middleware alias in **bootstrap/app.php**:

```php
->withMiddleware(function (Illuminate\Foundation\Configuration\Middleware $middleware) {
    $middleware->alias([
        'role' => \App\Http\Middleware\EnsureRole::class,
    ]);
})
```

### Admin endpoints
- `GET  /api/v1/admin/dashboard`
- `GET  /api/v1/admin/inspectors`
- `POST /api/v1/admin/inspectors`
- `PATCH /api/v1/admin/inspectors/{inspector}`
- `DELETE /api/v1/admin/inspectors/{inspector}`  (deactivate)
- `GET  /api/v1/admin/inspectors/{inspector}/jobs`
- `GET  /api/v1/admin/jobs`
- `POST /api/v1/admin/jobs`
- `PATCH /api/v1/admin/jobs/{job}`
- `DELETE /api/v1/admin/jobs/{job}`  (archive)
## Deployment (Self-Hosted)

This project is **self-hosted by me** on my own server (Proxmox CT/VM) and deployed
It runs directly on **Alpine Linux** using **Nginx + PHP-FPM** for the Laravel API, and **PostgreSQL** as database.
The React frontend is built locally and served as static files by Nginx.

---

## Server Stack
- **OS:** Alpine Linux
- **Web server / Reverse proxy:** Nginx
- **Backend:** Laravel 11 (PHP 8.x) via PHP-FPM
- **Database:** PostgreSQL
- **Frontend:** React (Vite) + Tailwind (Glass UI) + SweetAlert2
- **Auth:** Laravel Sanctum (Bearer token)
- **API Docs:** Swagger (L5-Swagger)

---

## Directory Structure on Server
Example:
- `/var/project/backend`  → Laravel API
- `/var/project/frontend/dist` → React build output served by Nginx

---

## Backend Setup (Laravel)

### 1) Configure `.env`
Inside `/var/project/backend/.env` set:
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://YOUR_DOMAIN

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=YOUR_DB
DB_USERNAME=YOUR_USER
DB_PASSWORD=YOUR_PASS
- # Inspector Scheduler Frontend — Glass Light (Pastel)

## Setup
```bash
npm install
```
Create `.env` in project root:
```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```
Run:
```bash
npm run dev
```


