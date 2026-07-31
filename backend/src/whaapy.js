import 'dotenv/config'

const WHAAPY_API_URL = 'https://api.whaapy.com'
const TAG_SITIO_WEB = 'sitio web'
const FUNNEL_STAGE_FORMULARIO_WEB = '448d08ba-b5f5-4025-80f5-881ab84a3a1f'

async function whaapyFetch(path, options = {}) {
  const res = await fetch(`${WHAAPY_API_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.WHAAPY_API_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  const data = await res.json().catch(() => null)
  return { ok: res.ok, status: res.status, data }
}

export function normalizePhoneE164(raw) {
  const digits = raw.replace(/[^\d+]/g, '')
  return digits.startsWith('+') ? digits : `+${digits}`
}

const TEMPLATE_FORMULARIO = 'formulario_pagina'
const TAG_DELAY_MS = 5000

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export async function syncContactoSitioWeb({ phone_number, name }) {
  const search = await whaapyFetch('/contacts/v1/search', {
    method: 'POST',
    body: JSON.stringify({
      filters: { phone_number: { eq: phone_number } },
      limit: 1,
    }),
  })

  if (!search.ok) {
    throw new Error(`Whaapy search failed: ${search.status} ${JSON.stringify(search.data)}`)
  }

  let contact = search.data?.contacts?.[0]

  if (!contact) {
    const create = await whaapyFetch('/contacts/v1', {
      method: 'POST',
      body: JSON.stringify({
        phone_number,
        name,
        source: 'api',
      }),
    })
    if (!create.ok) {
      throw new Error(`Whaapy create failed: ${create.status} ${JSON.stringify(create.data)}`)
    }
    contact = create.data.contact
  }

  const send = await whaapyFetch('/messages/v1', {
    method: 'POST',
    body: JSON.stringify({
      to: phone_number,
      type: 'template',
      templateName: TEMPLATE_FORMULARIO,
    }),
  })
  if (!send.ok) {
    console.error(`Whaapy template send failed: ${send.status} ${JSON.stringify(send.data)}`)
  }

  await sleep(TAG_DELAY_MS)

  const update = await whaapyFetch(`/contacts/v1/${contact.id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      add_tags: [TAG_SITIO_WEB],
      funnel_stage_id: FUNNEL_STAGE_FORMULARIO_WEB,
    }),
  })
  if (!update.ok) {
    throw new Error(`Whaapy tag failed: ${update.status} ${JSON.stringify(update.data)}`)
  }
  return update.data.contact
}
