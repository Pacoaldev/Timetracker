import { MASTER_PIN_HASH } from './pin.config.js'

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function validateMasterPin(pin) {
  if (!MASTER_PIN_HASH || MASTER_PIN_HASH === 'REEMPLAZA_CON_TU_HASH_SHA256') {
    return 'Falta configurar pin.config.js (copia desde pin.config.example.js).'
  }
  if (!pin) {
    return 'Introduce el PIN maestro.'
  }
  const hash = await sha256(pin)
  if (hash !== MASTER_PIN_HASH) {
    return 'PIN maestro incorrecto.'
  }
  return null
}
