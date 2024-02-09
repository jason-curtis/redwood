'use client'

// This needs to be a client component because it uses onClick, and the onClick
// event handler can't be serialized when passed as an RSC Flight response

import { forwardRef } from 'react'

import { navigate } from './history'

export interface LinkProps {
  to: string
  onClick?: React.MouseEventHandler<HTMLAnchorElement>
}

export const Link = forwardRef<
  HTMLAnchorElement,
  LinkProps & React.AnchorHTMLAttributes<HTMLAnchorElement>
>(({ to, onClick, ...rest }, ref) => (
  <a
    href={to}
    ref={ref}
    {...rest}
    onClick={(event) => {
      if (
        event.button !== 0 ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey
      ) {
        return
      }

      event.preventDefault()

      if (onClick) {
        const result = onClick(event)
        if (typeof result !== 'boolean' || result) {
          navigate(to)
        }
      } else {
        navigate(to)
      }
    }}
  />
))
