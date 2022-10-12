
export const valueAsType = (type: string, value: FormDataEntryValue | null) => {
  switch (type) {
    case 'string':
      return value?.toString() || null
    case 'boolean':
      return (value === 'true' || value === 'on') ? true : false
    case 'number':
      return typeof value === 'string' && !isNaN(parseFloat(value)) ? parseFloat(value) : null
    default:
      return value?.toString()
  }
}

export const getFields = <T>(formData: FormData, schema: { name: keyof T, type: string, isRequired: boolean }[]) => {
  const fieldValues = schema.reduce<T>((acc, field) => {
    const { name, type } = field
    const value = formData.get(name.toString())
    return {
      ...acc,
      [name]: valueAsType(type, value)
    }
  }, {} as T)

  const fieldErrors = schema.reduce<Record<keyof T, string | undefined>>((acc, field) => {
    const { name, type, isRequired } = field
    const value = formData.get(name.toString())

    const hasError: boolean = isRequired && (value === null || typeof valueAsType(type, value) !== type)
    if (hasError) {
      return {
        ...acc,
        [name]: `${name.toString()} is required`
      }
    }
    return acc
  }, {} as Record<keyof T, string | undefined>)

  return { fields: fieldValues, errors: fieldErrors }
}
