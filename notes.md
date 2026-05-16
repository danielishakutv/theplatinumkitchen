cd /home/theplatinumkitchen/app
git pull
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build


cd /home/theplatinumkitchen/app
git pull
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build


git pull

# payment_method enum gains 'bank_transfer' + 4 new settings columns
set -a; source .env.production; set +a
DATABASE_URL="postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/${POSTGRES_DB}" \
  pnpm exec drizzle-kit push

docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
