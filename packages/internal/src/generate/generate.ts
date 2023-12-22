#!/usr/bin/env node

import { getPaths } from '@redwoodjs/project-config'

import { generateGraphQLSchema } from './graphqlSchema'
import { generateTypeDefs } from './typeDefinitions'

export const generate = async () => {
  const { schemaPath, errors: generateGraphQLSchemaErrors } =
    await generateGraphQLSchema()
  const { typeDefFiles, errors: generateTypeDefsErrors } =
    await generateTypeDefs()

  let files = []

  if (schemaPath !== '') {
    files.push(schemaPath)
  }

  files = [...files, ...typeDefFiles].filter((x) => typeof x === 'string')

  return {
    files,
    errors: [...generateGraphQLSchemaErrors, ...generateTypeDefsErrors],
  }
}

export const run = async () => {
  console.log('Generating...')
  console.log()

  const { files, errors } = await generate()
  const rwjsPaths = getPaths()

  for (const f of files) {
    console.log('-', f.replace(rwjsPaths.base + '/', ''))
  }
  console.log()

  if (errors.length === 0) {
    console.log('... done.')
    console.log()
    return
  }
  process.exitCode ||= 1

  console.log('... done with errors.')
  console.log()

  for (const { message, error } of errors) {
    console.error(message)
    console.log()
    console.error(error)
    console.log()
  }
}

if (require.main === module) {
  run()
}
