import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node"
import invariant from "tiny-invariant"
import { requireUserId } from "~/session.server"

export async function action({ request, params }: ActionFunctionArgs) {
  await requireUserId(request)
  const formData = await request.formData()
  const redirectTo = formData.get('redirectTo')?.toString()
  invariant(redirectTo, 'redirectTo not found')

  const intent = formData.get('intent')

  const tempos = formData.getAll('tempos')
  const feels = formData.getAll('feels')
  const isCover = formData.get('isCover')
  const positions = formData.getAll('positions')

  const requestUrl = (new URL(request.url)).searchParams
  const searchParams = new URLSearchParams()
  const sortBy = requestUrl.get('sort')

  const tempoError = !Array.isArray(tempos) || [...tempos].some(tempo => typeof tempo !== 'string')
  const feelsError = !Array.isArray(feels) || [...feels].some(feel => typeof feel !== 'string')
  const isCoverError = typeof isCover !== 'string'
  const positionsError = !Array.isArray(positions) || [...positions].some(position => typeof position !== 'string')
  const formHasError = tempoError || feelsError || isCoverError || positionsError

  if (formHasError) {
    return null
  }

  if (sortBy) {
    searchParams.append('sort', sortBy)
  }
  tempos.forEach(tempo => {
    searchParams.append('tempos', tempo.toString())
  })
  feels.forEach(feel => {
    if (feel) {
      searchParams.append('feels', feel.toString())
    }
  })
  positions.forEach(position => {
    searchParams.append('positions', position.toString())
  })
  if (isCover.trim()) {
    searchParams.append('isCover', isCover)
  }

  if (intent === 'reset') {
    searchParams.delete('tempos')
    searchParams.delete('feels')
    searchParams.delete('positions')
    searchParams.delete('isCover')
    return redirect(`${redirectTo}?${searchParams.toString()}`)
  }

  return redirect(`${redirectTo}?${searchParams.toString()}`)
}