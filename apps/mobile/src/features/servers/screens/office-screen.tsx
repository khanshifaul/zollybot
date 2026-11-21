import { router } from "expo-router";
import { Typography } from "heroui-native";
import { Pressable, View } from "react-native";
import { BloubAvatar } from "@/features/agents/components/bloub-avatar";
import {
  type MobileAgent,
  useMobileWorkspace,
  useMobileWorkspaceSelector,
} from "@/features/workspace/context/mobile-workspace-context";
import { LargeTitleScrollView } from "@/shared/components/large-title";
import { haptics } from "@/shared/lib/haptics";
import { useText } from "@/shared/lib/text";
import { typeScale } from "@/shared/lib/type-scale";

const BUILDING = "__building__";

interface OfficeGroup {
  id: string;
  name: string;
  agents: MobileAgent[];
}

/**
 * The agents of the open server, grouped by the office that employs them. A building role such as
 * the butler has no office and comes last. The list reads the employment from `office-agents-v1`; a
 * host without it shows every agent under Building rather than an empty page.
 */
export function OfficeScreen() {
  const { t } = useText();
  const { agents, servers } = useMobileWorkspace();
  const activeServer = useMobileWorkspaceSelector((current) => current.activeServer);
  const server = servers.find((candidate) => candidate.id === activeServer?.id);
  const visible = agents.filter((agent) => !activeServer || agent.serverId === activeServer.id);

  const groups = new Map<string, OfficeGroup>();
  for (const agent of visible) {
    const id = agent.officeId ?? BUILDING;
    const group = groups.get(id) ?? {
      id,
      name: agent.officeName ?? (id === BUILDING ? t("mobile.offices.building") : id),
      agents: [],
    };
    group.agents.push(agent);
    groups.set(id, group);
  }
  const ordered = [...groups.values()].sort((left, right) =>
    left.id === BUILDING ? 1 : right.id === BUILDING ? -1 : left.name.localeCompare(right.name),
  );

  const open = (agent: MobileAgent) => {
    void haptics.selection();
    router.push({ pathname: "/chat/[agentId]", params: { agentId: agent.id } });
  };

  return (
    <LargeTitleScrollView title={t("mobile.app.route.offices")} caption={server?.name}>
      <Typography.Paragraph className="px-5 pb-3 text-muted" style={typeScale.preview}>
        {t("mobile.offices.hint")}
      </Typography.Paragraph>
      {ordered.length === 0 ? (
        <View className="px-5 py-10">
          <Typography.Paragraph className="text-center text-muted" style={typeScale.preview}>
            {t("mobile.offices.empty")}
          </Typography.Paragraph>
        </View>
      ) : null}
      {ordered.map((group) => (
        <View key={group.id} className="pb-2">
          <View className="flex-row items-center gap-1.5 px-5 pt-3 pb-1.5">
            <Typography.Paragraph
              accessibilityRole="header"
              className="font-medium text-muted"
              style={typeScale.caption}
            >
              {group.name}
            </Typography.Paragraph>
            <Typography.Paragraph className="text-muted opacity-60" style={typeScale.caption}>
              {t("mobile.offices.count", { count: group.agents.length })}
            </Typography.Paragraph>
          </View>
          {group.agents.map((agent) => (
            <Pressable
              key={agent.id}
              accessibilityRole="button"
              accessibilityLabel={t("mobile.agent.list.openWithTitle", {
                name: agent.name,
                title: agent.title.trim() || group.name,
              })}
              className="mx-3 flex-row items-center gap-3 rounded-2xl px-2 py-2"
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
              onPress={() => open(agent)}
            >
              <BloubAvatar
                agentId={agent.id}
                serverId={agent.serverId}
                hue={agent.avatarHue}
                color={agent.avatarColor}
                seed={agent.avatarSeed}
                size={40}
                animateIdle={false}
              />
              <View className="min-w-0 flex-1">
                <Typography.Paragraph className="font-semibold" numberOfLines={1} style={typeScale.preview}>
                  {agent.name}
                </Typography.Paragraph>
                <Typography.Paragraph className="text-text-secondary" numberOfLines={1} style={typeScale.small}>
                  {agent.title}
                </Typography.Paragraph>
              </View>
            </Pressable>
          ))}
        </View>
      ))}
    </LargeTitleScrollView>
  );
}
