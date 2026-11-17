import React from 'react'
import { renderToString } from 'react-dom/server'
import App from './App'
import { routeFromLocation } from './lib/site.mjs'

export function render(pathname) {
  return renderToString(<React.StrictMode><App initialRoute={routeFromLocation({ pathname })} /></React.StrictMode>)
}
