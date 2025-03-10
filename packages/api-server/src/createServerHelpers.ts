import { parseArgs } from 'util'

import type { FastifyServerOptions } from 'fastify'

import { coerceRootPath } from '@redwoodjs/fastify-web/dist/helpers'

import { getAPIHost, getAPIPort } from './cliHelpers'

export interface CreateServerOptions {
  /**
   * The prefix for all routes. Defaults to `/`.
   */
  apiRootPath?: string

  /**
   * Logger instance or options.
   */
  logger?: FastifyServerOptions['logger']

  /**
   * Options for the fastify server instance.
   * Omitting logger here because we move it up.
   */
  fastifyServerOptions?: Omit<FastifyServerOptions, 'logger'>

  /**
   * Whether to parse args or not. Defaults to `true`.
   */
  parseArgs?: boolean
}

type DefaultCreateServerOptions = Required<
  Omit<CreateServerOptions, 'fastifyServerOptions'> & {
    fastifyServerOptions: Pick<FastifyServerOptions, 'requestTimeout'>
  }
>

export const DEFAULT_CREATE_SERVER_OPTIONS: DefaultCreateServerOptions = {
  apiRootPath: '/',
  logger: {
    level:
      process.env.LOG_LEVEL ??
      (process.env.NODE_ENV === 'development' ? 'debug' : 'warn'),
  },
  fastifyServerOptions: {
    requestTimeout: 15_000,
  },
  parseArgs: true,
}

type ResolvedOptions = Required<
  Omit<CreateServerOptions, 'logger' | 'fastifyServerOptions' | 'parseArgs'> & {
    fastifyServerOptions: FastifyServerOptions
    port: number
    host: string
  }
>

export function resolveOptions(
  options: CreateServerOptions = {},
  args?: string[]
) {
  options.logger ??= DEFAULT_CREATE_SERVER_OPTIONS.logger

  // Set defaults.
  const resolvedOptions: ResolvedOptions = {
    apiRootPath:
      options.apiRootPath ?? DEFAULT_CREATE_SERVER_OPTIONS.apiRootPath,

    fastifyServerOptions: options.fastifyServerOptions ?? {
      requestTimeout:
        DEFAULT_CREATE_SERVER_OPTIONS.fastifyServerOptions.requestTimeout,
      logger: options.logger ?? DEFAULT_CREATE_SERVER_OPTIONS.logger,
    },

    host: getAPIHost(),
    port: getAPIPort(),
  }

  // Merge fastifyServerOptions.
  resolvedOptions.fastifyServerOptions.requestTimeout ??=
    DEFAULT_CREATE_SERVER_OPTIONS.fastifyServerOptions.requestTimeout
  resolvedOptions.fastifyServerOptions.logger = options.logger

  if (options.parseArgs) {
    const { values } = parseArgs({
      options: {
        host: {
          type: 'string',
        },
        port: {
          type: 'string',
          short: 'p',
        },
        apiRootPath: {
          type: 'string',
        },
      },
      ...(args && { args }),
    })

    if (values.host && typeof values.host !== 'string') {
      throw new Error('`host` must be a string')
    }
    if (values.host) {
      resolvedOptions.host = values.host
    }

    if (values.port) {
      resolvedOptions.port = +values.port

      if (isNaN(resolvedOptions.port)) {
        throw new Error('`port` must be an integer')
      }
    }

    if (values.apiRootPath && typeof values.apiRootPath !== 'string') {
      throw new Error('`apiRootPath` must be a string')
    }
    if (values.apiRootPath) {
      resolvedOptions.apiRootPath = values.apiRootPath
    }
  }

  resolvedOptions.apiRootPath = coerceRootPath(resolvedOptions.apiRootPath)

  return resolvedOptions
}
