import * as migration_20260406_073308 from './20260406_073308';
import * as migration_20260408_155700_ensure_pages_content_jsonb from './20260408_155700_ensure_pages_content_jsonb';
import * as migration_20260429_165200_add_translations_locked_docs from './20260429_165200_add_translations_locked_docs';
import * as migration_20260512_135600_add_author_profile_homepage_marquee from './20260512_135600_add_author_profile_homepage_marquee';
import * as migration_20260513_160500_add_digital_downloads from './20260513_160500_add_digital_downloads';
import * as migration_20260514_003500_member_email_settings_site_users from './20260514_003500_member_email_settings_site_users';
import * as migration_20260515_140500_add_email_settings_provider from './20260515_140500_add_email_settings_provider';

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
  {
    up: migration_20260429_165200_add_translations_locked_docs.up,
    down: migration_20260429_165200_add_translations_locked_docs.down,
    name: '20260429_165200_add_translations_locked_docs'
  },
  {
    up: migration_20260512_135600_add_author_profile_homepage_marquee.up,
    down: migration_20260512_135600_add_author_profile_homepage_marquee.down,
    name: '20260512_135600_add_author_profile_homepage_marquee'
  },
  {
    up: migration_20260513_160500_add_digital_downloads.up,
    down: migration_20260513_160500_add_digital_downloads.down,
    name: '20260513_160500_add_digital_downloads'
  },
  {
    up: migration_20260514_003500_member_email_settings_site_users.up,
    down: migration_20260514_003500_member_email_settings_site_users.down,
    name: '20260514_003500_member_email_settings_site_users'
  },
  {
    up: migration_20260515_140500_add_email_settings_provider.up,
    down: migration_20260515_140500_add_email_settings_provider.down,
    name: '20260515_140500_add_email_settings_provider'
  },
];
