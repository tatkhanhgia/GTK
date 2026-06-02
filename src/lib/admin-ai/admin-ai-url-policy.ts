function isPrivateIpv4(hostname: string) {
  const parts = hostname.split('.').map((part) => Number(part))
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return false
  }

  const [first, second] = parts
  return (
    first === 10 ||
    first === 127 ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  )
}

export function isAllowedAdminAiBaseUrl(url: URL) {
  if (url.protocol === 'https:') return true
  if (process.env.NODE_ENV === 'production' || url.protocol !== 'http:') return false
  return url.hostname === 'localhost' || url.hostname === '::1' || isPrivateIpv4(url.hostname)
}

export function getAdminAiBaseUrlPolicyMessage() {
  return 'Base URL must use https, except localhost/private-network http in development.'
}
