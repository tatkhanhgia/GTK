#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-backups}"
POSTGRES_SERVICE="${POSTGRES_SERVICE:-postgres}"
POSTGRES_USER="${POSTGRES_USER:-gtkblog}"
POSTGRES_DB="${POSTGRES_DB:-gtkblog}"
COMPOSE_COMMAND="${COMPOSE_COMMAND:-docker compose}"
BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_FILE="${BACKUP_DIR}/gtkblog-${TIMESTAMP}.sql"

mkdir -p "${BACKUP_DIR}"

cleanup_old_backups() {
  case "${BACKUP_RETENTION_DAYS}" in
    ''|*[!0-9]*)
      printf '[backup-production-db] invalid BACKUP_RETENTION_DAYS=%s, skipping cleanup\n' "${BACKUP_RETENTION_DAYS}" >&2
      ;;
    0)
      printf '[backup-production-db] backup cleanup disabled\n'
      ;;
    *)
      find "${BACKUP_DIR}" -maxdepth 1 -type f -name 'gtkblog-*.sql' -mtime +"${BACKUP_RETENTION_DAYS}" -print -delete
      ;;
  esac
}

cleanup_old_backups

printf '[backup-production-db] writing %s\n' "${BACKUP_FILE}"
${COMPOSE_COMMAND} exec -T "${POSTGRES_SERVICE}" pg_dump -U "${POSTGRES_USER}" "${POSTGRES_DB}" < /dev/null > "${BACKUP_FILE}"

if [ ! -s "${BACKUP_FILE}" ]; then
  rm -f "${BACKUP_FILE}"
  printf '[backup-production-db] backup failed: empty dump\n' >&2
  exit 1
fi

printf '[backup-production-db] complete: %s\n' "${BACKUP_FILE}"
cleanup_old_backups
