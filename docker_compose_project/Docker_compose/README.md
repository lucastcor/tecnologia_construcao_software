# Ambiente de Desenvolvimento Full-Stack com Docker Compose
Ambiente padronizado e reprodutível para uma aplicação web:
- **Frontend**: React + Vite
- **Backend**: NestJS
- **Banco**: PostgreSQL 
- **Admin DB**: pgAdmin 
- **Proxy Reverso**: Nginx 

## Pré-requisitos
- Docker Desktop 4.x+ (Compose v2)
- Porta externa definida em `${NGINX_PORT}` livre no host

## Subir o ambiente:
- **docker compose up --build**

## Cadastre um server com:
**Host:** postgres
**Port:** 5432
**Maintenance DB:** postgres
**Username/Password:** ${POSTGRES_USER} / ${POSTGRES_PASSWORD}

## parar containers:
**docker compose down** 
