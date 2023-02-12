import { capitalizeFirstLetter } from './assorted'
// Assorted utils
describe('Assorted utils', () => {
  test('Capitalize first letter', () => {
    expect(capitalizeFirstLetter('test')).toBe('Test')
  })
})