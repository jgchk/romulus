import { FC, PropsWithChildren, useEffect, useState } from 'react'

const ClientOnly: FC<PropsWithChildren> = ({ children }) => {
  const [render, setRender] = useState(false)

  useEffect(() => setRender(true), [])

  return render ? <>{children}</> : null
}

export default ClientOnly
