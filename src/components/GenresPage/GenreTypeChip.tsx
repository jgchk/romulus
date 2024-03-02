import { GenreType } from '../../server/db/genre/outputs'
import { GenreTypeNames, GenreTypeChipNames } from '../../utils/genres'
import Chip from '../common/Chip'
import { FC, useMemo } from 'react'

const GenreTypeChip: FC<{ type: GenreType; className?: string }> = ({
  type,
  className,
}) => {
  const title = useMemo(() => GenreTypeNames[type], [type])
  const text = useMemo(() => GenreTypeChipNames[type], [type])

  return <Chip text={text} title={title} className={className} />
}

export default GenreTypeChip
