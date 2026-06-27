import { useGameStore } from '@/store/gameStore';
import { CampaignProgressCard } from '@/ui/components/CampaignProgressCard';

export function OverworldQuestTracker() {
  const save = useGameStore((s) => s.save);
  return <CampaignProgressCard save={save} variant="overlay" />;
}
