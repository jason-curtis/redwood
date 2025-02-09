globalThis.__dirname = __dirname
vi.mock('fs-extra')
vi.mock('../../../../lib', async (importOriginal) => {
  const originalLib = await importOriginal()
  return {
    ...originalLib,
    generateTemplate: () => '',
  }
})

import fs from 'fs-extra'
import { vol } from 'memfs'
import { vi, beforeEach, afterEach, test, expect } from 'vitest'

import '../../../../lib/test'

import { getPaths } from '../../../../lib'
import { files } from '../../../generate/page/page'
import { tasks } from '../page'

beforeEach(() => {
  vol.fromJSON({
    ...files({ name: 'About' }),
    [getPaths().web.routes]: [
      '<Routes>',
      '  <Route path="/about" page={AboutPage} name="about" />',
      '  <Route path="/" page={HomePage} name="home" />',
      '  <Route notfound page={NotFoundPage} />',
      '</Routes>',
    ].join('\n'),
  })
})

afterEach(() => {
  vol.reset()
  vi.spyOn(fs, 'unlinkSync').mockClear()
})

test('destroys page files', async () => {
  const unlinkSpy = vi.spyOn(fs, 'unlinkSync')
  const t = tasks({ name: 'About' })
  t.options.renderer = 'silent'

  return t.tasks[0].run().then(() => {
    const generatedFiles = Object.keys(files({ name: 'About' }))
    expect(generatedFiles.length).toEqual(unlinkSpy.mock.calls.length)
    generatedFiles.forEach((f) => expect(unlinkSpy).toHaveBeenCalledWith(f))
  })
})

test('destroys page files with stories and tests', async () => {
  const fileOptions = { name: 'About', stories: true, tests: true }
  vol.fromJSON({
    ...files(fileOptions),
    [getPaths().web.routes]: [
      '<Routes>',
      '  <Route path="/about" page={AboutPage} name="about" />',
      '  <Route path="/" page={HomePage} name="home" />',
      '  <Route notfound page={NotFoundPage} />',
      '</Routes>',
    ].join('\n'),
  })

  const unlinkSpy = vi.spyOn(fs, 'unlinkSync')
  const t = tasks(fileOptions)
  t.options.renderer = 'silent'

  return t.tasks[0].run().then(() => {
    const generatedFiles = Object.keys(files(fileOptions))
    expect(generatedFiles.length).toEqual(unlinkSpy.mock.calls.length)
    generatedFiles.forEach((f) => expect(unlinkSpy).toHaveBeenCalledWith(f))
  })
})

test('cleans up route from Routes.js', async () => {
  const t = tasks({ name: 'About' })
  t.options.renderer = 'silent'

  return t.tasks[1].run().then(() => {
    const routes = fs.readFileSync(getPaths().web.routes, 'utf-8')
    expect(routes).toEqual(
      [
        '<Routes>',
        '  <Route path="/" page={HomePage} name="home" />',
        '  <Route notfound page={NotFoundPage} />',
        '</Routes>',
      ].join('\n')
    )
  })
})

test('cleans up route with a custom path from Routes.js', async () => {
  const t = tasks({ name: 'About', path: '/about-us' })
  t.options.renderer = 'silent'

  return t.tasks[1].run().then(() => {
    const routes = fs.readFileSync(getPaths().web.routes, 'utf-8')
    expect(routes).toEqual(
      [
        '<Routes>',
        '  <Route path="/" page={HomePage} name="home" />',
        '  <Route notfound page={NotFoundPage} />',
        '</Routes>',
      ].join('\n')
    )
  })
})
