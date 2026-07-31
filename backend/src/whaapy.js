import 'dotenv/config'

const WHAAPY_API_URL = 'https://api.whaapy.com'
const TAG_SITIO_WEB = 'sitio web'
const FUNNEL_STAGE_FORMULARIO_WEB = '448d08ba-b5f5-4025-80f5-881ab84a3a1f'

// Rotación round robin para asignar agente (GET /team/v1)
const AGENTES_ROUND_ROBIN = [
  { id: '5225d34b-df2d-43ae-8240-2b384b904e7e', nombre: 'Sharon' },
  { id: 'ecffcdfb-a38e-49ff-80cd-a09fe0018f82', nombre: 'Monserrat' },
  { id: '1ace76ee-1c4d-4eaa-a38a-9c8ec2ec3f59', nombre: 'Claudia' },
  { id: 'c361a82e-7b48-4e01-aaa5-27038e612539', nombre: 'Berenice' },
]

async function nombreDeAgente(agentId) {
  if (!agentId) return null
  const conocido = AGENTES_ROUND_ROBIN.find((a) => a.id === agentId)
  if (conocido) return conocido.nombre
  const team = await whaapyFetch('/team/v1')
  const agente = team.data?.agents?.find((a) => a.id === agentId)
  return agente?.name?.trim() || agente?.email || agentId
}

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

export async function syncContactoSitioWeb({ phone_number, name, rotationSeed }) {
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

  const patchBody = {
    add_tags: [TAG_SITIO_WEB],
    funnel_stage_id: FUNNEL_STAGE_FORMULARIO_WEB,
  }
  // Solo asignar agente si el contacto no tiene uno ya asignado
  if (!contact.assigned_agent_id) {
    patchBody.assigned_agent_id =
      AGENTES_ROUND_ROBIN[Math.abs(rotationSeed ?? 0) % AGENTES_ROUND_ROBIN.length].id
  }

  const update = await whaapyFetch(`/contacts/v1/${contact.id}`, {
    method: 'PATCH',
    body: JSON.stringify(patchBody),
  })
  if (!update.ok) {
    throw new Error(`Whaapy tag failed: ${update.status} ${JSON.stringify(update.data)}`)
  }

  const agenteId =
    update.data.contact?.assigned_agent_id ??
    patchBody.assigned_agent_id ??
    contact.assigned_agent_id
  return {
    contact: update.data.contact,
    agenteNombre: await nombreDeAgente(agenteId),
  }
}
