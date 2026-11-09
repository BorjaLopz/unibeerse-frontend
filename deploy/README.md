# Unibeerse en el NUC

Stack: **Spring Boot** (API) + **Postgres** (compartido con Ledger, base `unibeerse`) + **nginx** (web) + **Tailscale Funnel** (publicación en internet, con su propia dirección).
Login: Firebase Authentication (la web sigue usando el proyecto `unibeerse-db` solo para eso). Los datos viven en tu Postgres.

## 1. Base de datos (una vez)

Crea el usuario y la base en el Postgres del NUC (ajusta `-U postgres` al superusuario que uses):

```bash
docker exec -it postgres psql -U postgres -c "CREATE USER unibeerse_user WITH PASSWORD 'PON_UNA_CONTRASEÑA_LARGA';" -c "CREATE DATABASE unibeerse OWNER unibeerse_user;"
```

`unibeerse_user` solo es dueño de la base `unibeerse`: no ve la de Ledger.

## 2. Configuración

```bash
cd deploy
cp .env.example .env && chmod 600 .env && nano .env
```

- `UNIBEERSE_DB_PASSWORD`: la del paso 1.
- `ADMIN_UIDS`: tu uid de Firebase (Firebase Console → Authentication → Usuarios → columna «UID de usuario»). Solo ese uid podrá añadir/editar cervezas y borrar comentarios ajenos.
- `TS_AUTHKEY`: ver paso 3.
- `TELEGRAM_*` (opcional): para recibir por Telegram los mensajes del formulario de contacto. Puedes reutilizar los valores de `~/backups/.telegram`.

## 3. Tailscale (publicar la web)

1. En la consola de Tailscale (login.tailscale.com) → **Settings → Keys → Generate auth key**: marca *Reusable* **desactivado** y *Ephemeral* **desactivado**; cópiala en `TS_AUTHKEY`.
2. **Access controls**: Funnel debe estar permitido. En el editor de la política, la sección `nodeAttrs` debe incluir:
   `{"target": ["autogroup:member"], "attr": ["funnel"]}` (la consola te lo ofrece al activar Funnel; si ya lo usas, no hay que tocar nada).
3. La web quedará en `https://unibeerse.<tu-tailnet>.ts.net` (p. ej. `https://unibeerse.tail9e5eae.ts.net`). Tus otros servicios (Ledger, Kuma, Homepage) siguen privados.
4. Firebase Console → Authentication → Settings → **Dominios autorizados** → añade `unibeerse.tail9e5eae.ts.net`.

## 4. Arrancar

```bash
docker compose --env-file .env up -d --build
docker compose logs -f unibeerse-api   # espera a "Started UnibeerseApplication"
```

## 5. Importar las cervezas (una vez)

En tu PC, desde la raíz del repo:

```bash
node migration/export-firestore.mjs    # baja cervezas y comentarios de Firestore
node migration/to-sql.mjs              # genera migration/out/import.sql
```

Copia `migration/out/import.sql` al NUC y cárgalo:

```bash
docker exec -i postgres psql -U unibeerse_user -d unibeerse < import.sql
```

(`migration/out/` está en `.gitignore`: no se sube al repo.)

## 6. Backups

El `pg_dumpall` del backup nocturno ya incluye la base `unibeerse`. Las fotos subidas desde el panel de administración están en el volumen `unibeerse_media`; añádelo a tu script igual que los tickets de Ledger (`docker run --rm -v unibeerse_media:/src:ro ...` y `rclone copy` a `gdrive-crypt:unibeerse-media`).

## 7. Monitorización

En Uptime Kuma añade un monitor HTTP a `http://unibeerse-web/` y otro a `http://unibeerse-api:8080/actuator/health` (palabra clave `UP`). Recuerda que Kuma tiene que estar en la red `backend`... y para ver `unibeerse-web` también en `unibeerse_net`:
`docker network connect deploy_unibeerse_net uptime-kuma`.


## Frontend nuevo (fase 2)

La web se reescribió en React + TypeScript (Vite). Cambios respecto a la antigua: sin Tailwind, styled-components, EmailJS,
crypto-js ni Firestore; Firebase solo se usa para iniciar sesión.

1. Rama `selfhost`, desde la raíz del repo: `bash deploy/limpiar.sh` (borra la web antigua con `git rm`).
2. Descomprime `unibeerse-fase2.zip` encima.
3. `npm install` (genera `package-lock.json`; haz commit de él) y `npm run build` para comprobar que compila.
4. Para desarrollar en local: `npm run dev` (necesita la API en `localhost:8080` y un `.env.local` con las `VITE_FIREBASE_*`).
5. Despliegue: lo de la sección 4 (`docker compose ... up -d --build`) ya construye la web.

Las direcciones antiguas `/beer/<n>` redirigen a la ficha nueva.
