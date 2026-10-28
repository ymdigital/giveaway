import { GiveawayApp } from "@/components/GiveawayApp";

interface ListPageProps {
  params: Promise<{ code: string }>;
}

export default async function ListPage({ params }: ListPageProps) {
  const { code } = await params;
  return <GiveawayApp initialCode={code} />;
}
