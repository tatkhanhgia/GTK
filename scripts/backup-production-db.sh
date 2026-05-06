#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-backups}"
POSTGRES_SERVICE="${POSTGRES_SERVICE:-postgres}"
POSTGRES_USER="${POSTGRES_USER:-gtkblog}"
POSTGRES_DB="${POSTGRES_DB:-gtkblog}"
COMPOSE_COMMAND="${COMPOSE_COMMAND:-docker compose}"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_FILE="${BACKUP_DIR}/gtkblog-${TIMESTAMP}.sql"

mkdir -p "${BACKUP_DIR}"

printf '[backup-production-db] writing %s\n' "${BACKUP_FILE}"
${COMPOSE_COMMAND} exec -T "${POSTGRES_SERVICE}" pg_dump -U "${POSTGRES_USER}" "${POSTGRES_DB}" > "${BACKUP_FILE}"

if [ ! -s "${BACKUP_FILE}" ]; then
  rm -f "${BACKUP_FILE}"
  printf '[backup-production-db] backup failed: empty dump\n' >&2
  exit 1
fi

printf '[backup-production-db] complete: %s\n' "${BACKUP_FILE}"
