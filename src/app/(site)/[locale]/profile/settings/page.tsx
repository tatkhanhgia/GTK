import { getProfileSettings } from '@/lib/profile/get-profile-settings'
import SettingsForm from './settings-form'

export default async function SettingsPage() {
  const settings = await getProfileSettings()
  if (!settings) return null
  return <SettingsForm settings={settings} />
}
