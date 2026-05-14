cd /home/theplatinumkitchen/app
git pull
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
