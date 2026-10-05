import { Tag } from '@/components/common/Tag'

export function TagBadge({ name }) {
  return <Tag label={name} to={`/questions?tag=${encodeURIComponent(name)}`} />
}