import * as migration_20260406_073308 from './20260406_073308';
import * as migration_20260408_155700_ensure_pages_content_jsonb from './20260408_155700_ensure_pages_content_jsonb';

export const migrations = [
  {
    up: migration_20260406_073308.up,
    down: migration_20260406_073308.down,
    name: '20260406_073308'
  },
  {
    up: migration_20260408_155700_ensure_pages_content_jsonb.up,
    down: migration_20260408_155700_ensure_pages_content_jsonb.down,
    name: '20260408_155700_ensure_pages_content_jsonb'
  },
];
