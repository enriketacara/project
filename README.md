# OUR COMPANY Inspector Scheduler - Laravel 11 (API) + Postgres + Swagger

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

## Demo users (seeded)
Password for all: `Password123!`
- `uk.inspector@company.test` (UK / Europe/London)
- `mx.inspector@company.test` (MEXICO / America/Mexico_City)
- `in.inspector@company.test` (INDIA / Asia/Kolkata)

## Key endpoints
- `POST /api/v1/auth/login`
- `GET  /api/v1/jobs?status=OFFERED`
- `POST /api/v1/jobs/{job}/claim`
- `PATCH /api/v1/jobs/{job}/schedule`
- `POST /api/v1/jobs/{job}/complete`
- `GET  /api/v1/my/jobs`

## Notes for presentation
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

### Admin demo user
Password: `Password123!`
- `admin@company.test` (role=ADMIN)

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

