import 'dotenv/config'

const WHAAPY_API_URL = 'https://api.whaapy.com'
const TAG_SITIO_WEB = 'sitio web'
const FUNNEL_STAGE_FORMULARIO_WEB = '448d08ba-b5f5-4025-80f5-881ab84a3a1f'

// Rotación round robin para asignar agente (GET /team/v1)
const AGENTES_ROUND_ROBIN = [
  { id: '5225d34b-df2d-43ae-8240-2b384b904e7e', nombre: 'Sharon' },
  { id: 'ecffcdfb-a38e-49ff-80cd-a09fe0018f82', nombre: 'Monserrat' },
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

const soloDigitos = (phone) => (phone ?? '').replace(/\D/g, '')

// Busca por los últimos 10 dígitos para encontrar el contacto aunque Whaapy
// lo tenga guardado con otro prefijo (ej. +521 vs +52 en México).
async function buscarContacto(phone_number) {
  const ultimos10 = soloDigitos(phone_number).slice(-10)
  const search = await whaapyFetch('/contacts/v1/search', {
    method: 'POST',
    body: JSON.stringify({
      filters: { phone_number: { contains: ultimos10 } },
      limit: 10,
    }),
  })
  if (!search.ok) {
    throw new Error(`Whaapy search failed (${phone_number}): ${search.status} ${JSON.stringify(search.data)}`)
  }
  const candidatos = (search.data?.contacts ?? []).filter((c) =>
    soloDigitos(c.phone_number).endsWith(ultimos10)
  )
  // Si hay duplicados, preferir el que tiene conversación más reciente
  candidatos.sort((a, b) => (b.last_contact_at ?? '').localeCompare(a.last_contact_at ?? ''))
  return candidatos[0] ?? null
}

export async function syncContactoSitioWeb({ phone_number, name, rotationSeed }) {
  if (soloDigitos(phone_number).length < 10) {
    throw new Error(`Teléfono inválido, no se sincroniza con Whaapy: ${phone_number}`)
  }

  let contact = await buscarContacto(phone_number)

  if (!contact) {
    const create = await whaapyFetch('/contacts/v1', {
      method: 'POST',
      body: JSON.stringify({
        phone_number,
        name,
        source: 'api',
      }),
    })
    if (create.ok) {
      contact = create.data.contact
    } else {
      // Puede fallar porque ya existe con otro formato; reintentar la búsqueda
      contact = await buscarContacto(phone_number)
      if (!contact) {
        throw new Error(`Whaapy create failed (${phone_number}): ${create.status} ${JSON.stringify(create.data)}`)
      }
    }
  }

  // Enviar al número que Whaapy tiene guardado para que caiga en la misma conversación
  const send = await whaapyFetch('/messages/v1', {
    method: 'POST',
    body: JSON.stringify({
      to: contact.phone_number ?? phone_number,
      type: 'template',
      templateName: TEMPLATE_FORMULARIO,
    }),
  })
  if (!send.ok) {
    console.error(`Whaapy template send failed (${phone_number}): ${send.status} ${JSON.stringify(send.data)}`)
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

  let update = await whaapyFetch(`/contacts/v1/${contact.id}`, {
    method: 'PATCH',
    body: JSON.stringify(patchBody),
  })
  if (!update.ok && patchBody.assigned_agent_id) {
    // Si falla la asignación (ej. agente que ya no está en el equipo), al menos aplicar tag y etapa
    console.error(
      `Whaapy assign failed (${phone_number}, agente ${patchBody.assigned_agent_id}): ${update.status} ${JSON.stringify(update.data)}`
    )
    delete patchBody.assigned_agent_id
    update = await whaapyFetch(`/contacts/v1/${contact.id}`, {
      method: 'PATCH',
      body: JSON.stringify(patchBody),
    })
  }
  if (!update.ok) {
    throw new Error(`Whaapy tag failed (${phone_number}): ${update.status} ${JSON.stringify(update.data)}`)
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
