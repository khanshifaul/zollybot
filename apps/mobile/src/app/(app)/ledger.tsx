import type { OfficeTask, OfficeTaskStatus } from "@zollybot/contracts/ipc-office-tasks";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { Typography } from "heroui-native";
import ChevronLeft from "lucide-react-native/icons/chevron-left";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  type ScrollViewInstance,
  useWindowDimensions,
  View,
} from "react-native";
import { useMobileSession } from "@/features/auth/context/mobile-session-context";
import { useMobileWorkspace } from "@/features/workspace/context/mobile-workspace-context";
import { AndroidHeaderButton } from "@/shared/components/android-header-button";
import { LargeTitleScrollView } from "@/shared/components/large-title";
import { isAndroid } from "@/shared/lib/platform";
import { useText } from "@/shared/lib/text";

interface LedgerPayload {
  offices: Array<{ id: string; name: string }>;
  tasks: OfficeTask[];
}

const LOBBY_ID = "unassigned";
type KanbanLabelKey =
  | "mobile.app.ledger.kanban.queued"
  | "mobile.app.ledger.kanban.dispatched"
  | "mobile.app.ledger.kanban.review"
  | "mobile.app.ledger.kanban.done";

const KANBAN: ReadonlyArray<{ key: string; labelKey: KanbanLabelKey; statuses: OfficeTaskStatus[] }> = [
  { key: "queued", labelKey: "mobile.app.ledger.kanban.queued", statuses: ["queued"] },
  { key: "dispatched", labelKey: "mobile.app.ledger.kanban.dispatched", statuses: ["dispatched"] },
  {
    key: "review",
    labelKey: "mobile.app.ledger.kanban.review",
    statuses: ["blocked", "paused", "escalated", "failed"],
  },
  { key: "done", labelKey: "mobile.app.ledger.kanban.done", statuses: ["done"] },
];

/** The office ledger: all offices first, then one office's summary and paged kanban. */
export default function LedgerScreen() {
  const { t } = useText();
  const { session, pairedHosts } = useMobileSession();
  const { serverId } = useLocalSearchParams<{ serverId?: string }>();
  const { servers, agents } = useMobileWorkspace();
  const { width } = useWindowDimensions();
  const server = servers.find((item) => item.id === serverId);
  const id = serverId ?? server?.id ?? "";
  const credential =
    pairedHosts.find((host) => host.host?.hostId === id) ?? (session?.host?.hostId === id ? session : null);
  const [payload, setPayload] = useState<LedgerPayload | null>(null);
  const [officeId, setOfficeId] = useState<string | null>(null);
  const [columnIndex, setColumnIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const board = useRef<ScrollViewInstance>(null);
  const columnWidth = Math.min(Math.max(Math.round(width * 0.84), 260), 440);
  const columnStep = columnWidth + 12;
  const goBack = () => {
    if (officeId) {
      setOfficeId(null);
      return;
    }
    router.back();
  };
  const header = isAndroid ? (
    <AndroidHeaderButton
      placement="left"
      icon={ChevronLeft}
      glass
      accessibilityLabel={t("mobile.app.ledger.back")}
      onPress={goBack}
    />
  ) : (
    <Stack.Toolbar placement="left">
      <Stack.Toolbar.Button icon="chevron.left" onPress={goBack} />
    </Stack.Toolbar>
  );

  const load = useCallback(async () => {
    if (!credential) return;
    setLoading(true);
    try {
      const response = await fetch(new URL("/v1/mobile-auth/office-ledger", credential.apiUrl), {
        headers: { Authorization: `Bearer ${credential.sessionToken}`, Accept: "application/json" },
      });
      if (!response.ok) throw new Error(`The host answered ${response.status}.`);
      const value: Partial<LedgerPayload> = await response.json();
      if (!Array.isArray(value.tasks) || !Array.isArray(value.offices))
        throw new Error("The host returned an invalid ledger.");
      setPayload({ offices: value.offices, tasks: value.tasks });
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setLoading(false);
    }
  }, [credential]);

  useEffect(() => {
    void load();
    if (!credential) return;
    const timer = setInterval(() => void load(), 15_000);
    return () => clearInterval(timer);
  }, [credential, load]);

  useEffect(() => {
    board.current?.scrollTo({ x: columnIndex * columnStep, animated: false });
  }, [columnIndex, columnStep]);

  const namedOffices = payload?.offices ?? [];
  const allOffices = useMemo(() => {
    const result = [{ id: LOBBY_ID, name: t("mobile.app.ledger.lobby") }];
    for (const office of namedOffices) {
      if (office.id !== LOBBY_ID && office.name.toLowerCase() !== "lobby") result.push(office);
    }
    return result.sort((left, right) => left.name.localeCompare(right.name));
  }, [namedOffices, t]);
  const officeName = (value: string) => allOffices.find((office) => office.id === value)?.name ?? value;
  const agentName = (agentId: string | null) => {
    if (!agentId) return null;
    return agents.find((agent) => agent.id === agentId)?.name ?? agentId;
  };
  const tasksOf = (value: string) => (payload?.tasks ?? []).filter((task) => task.officeId === value);
  const activeTasks = officeId ? tasksOf(officeId) : [];
  const goToColumn = (index: number) => {
    setColumnIndex(index);
    board.current?.scrollTo({ x: index * columnStep, animated: true });
  };
  const firstNote = !credential
    ? t("mobile.app.ledger.unsupported")
    : loading && !payload
      ? t("mobile.server.threads.loading")
      : null;

  return (
    <>
      {header}
      {officeId ? (
        <LargeTitleScrollView title={officeName(officeId)} caption={server?.name} contentContainerClassName="pt-1">
          {error ? <Typography.Paragraph className="px-5 py-2 text-danger-text">{error}</Typography.Paragraph> : null}
          <OfficeSummary tasks={activeTasks} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingHorizontal: 20, paddingVertical: 10 }}
          >
            {KANBAN.map((column, index) => {
              const count = activeTasks.filter((task) => column.statuses.includes(task.status)).length;
              const active = columnIndex === index;
              return (
                <Pressable
                  key={column.key}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => goToColumn(index)}
                  className={`rounded-full border px-2.5 py-1 ${active ? "border-accent bg-accent" : "border-border bg-control"}`}
                >
                  <Typography.Paragraph
                    className={active ? "text-accent-foreground" : "text-foreground"}
                    style={{ fontSize: 11, fontWeight: "600" }}
                  >
                    {t(column.labelKey)} {count}
                  </Typography.Paragraph>
                </Pressable>
              );
            })}
          </ScrollView>
          <ScrollView
            ref={board}
            horizontal
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={columnStep}
            snapToAlignment="start"
            onMomentumScrollEnd={(event: NativeSyntheticEvent<NativeScrollEvent>) =>
              setColumnIndex(Math.round(event.nativeEvent.contentOffset.x / columnStep))
            }
            contentContainerStyle={{ gap: 12, paddingHorizontal: 20, paddingBottom: 12 }}
          >
            {KANBAN.map((column) => {
              const columnTasks = activeTasks.filter((task) => column.statuses.includes(task.status));
              return (
                <View
                  key={column.key}
                  className="gap-1.5 rounded-grouped border border-border bg-grouped p-2.5"
                  style={{ width: columnWidth }}
                >
                  <View className="flex-row items-center justify-between">
                    <Typography.Paragraph weight="semibold" style={{ fontSize: 13 }}>
                      {t(column.labelKey)}
                    </Typography.Paragraph>
                    <Typography.Paragraph className="text-muted" style={{ fontSize: 12 }}>
                      {columnTasks.length}
                    </Typography.Paragraph>
                  </View>
                  {columnTasks.length === 0 ? (
                    <Typography.Paragraph type="body-xs" className="py-3 text-muted">
                      {t("mobile.app.ledger.emptyOffice")}
                    </Typography.Paragraph>
                  ) : (
                    columnTasks.map((task) => (
                      <Pressable
                        key={task.id}
                        accessibilityRole={task.assignedAgentId ? "button" : undefined}
                        disabled={!task.assignedAgentId}
                        onPress={() =>
                          task.assignedAgentId
                            ? router.push({ pathname: "/chat/[agentId]", params: { agentId: task.assignedAgentId } })
                            : undefined
                        }
                        className="gap-0.5 rounded-lg border border-border bg-control p-2"
                        style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                      >
                        <Typography.Paragraph weight="semibold" numberOfLines={2} style={{ fontSize: 13 }}>
                          {task.title}
                        </Typography.Paragraph>
                        <Typography.Paragraph type="body-xs" className="text-muted" numberOfLines={1}>
                          {agentName(task.assignedAgentId) ?? task.assignedRoleKey ?? "—"}
                          {task.gate ? ` · ${task.gate}` : ""}
                        </Typography.Paragraph>
                      </Pressable>
                    ))
                  )}
                </View>
              );
            })}
          </ScrollView>
          <View style={{ height: 24 }} />
        </LargeTitleScrollView>
      ) : (
        <LargeTitleScrollView
          title={t("mobile.app.route.ledger")}
          caption={server?.name}
          contentContainerClassName="pt-1"
        >
          {error ? <Typography.Paragraph className="px-5 py-2 text-danger-text">{error}</Typography.Paragraph> : null}
          {firstNote ? <Typography.Paragraph className="px-5 py-4 text-muted">{firstNote}</Typography.Paragraph> : null}
          {allOffices.map((office) => {
            const tasks = tasksOf(office.id);
            const open = tasks.filter((task) => task.status !== "done" && task.status !== "failed").length;
            return (
              <Pressable
                key={office.id}
                accessibilityRole="button"
                onPress={() => {
                  const first = KANBAN.findIndex((column) =>
                    tasks.some((task) => column.statuses.includes(task.status)),
                  );
                  setColumnIndex(Math.max(first, 0));
                  setOfficeId(office.id);
                }}
                className="flex-row items-center gap-3 px-5 py-2.5"
                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
              >
                <Typography.Paragraph weight="semibold" className="min-w-0 flex-1" numberOfLines={1}>
                  {office.name}
                </Typography.Paragraph>
                <Typography.Paragraph style={{ fontSize: 12 }} className="text-muted">
                  {t("mobile.app.ledger.openCount", { count: String(open) })}
                </Typography.Paragraph>
                <Typography.Paragraph style={{ fontSize: 12 }} className="text-muted">
                  {t("mobile.app.ledger.tasksCount", { count: String(tasks.length) })}
                </Typography.Paragraph>
              </Pressable>
            );
          })}
          <View style={{ height: 24 }} />
        </LargeTitleScrollView>
      )}
    </>
  );
}

function OfficeSummary({ tasks }: { tasks: OfficeTask[] }) {
  const { t } = useText();
  const open = tasks.filter((task) => task.status !== "done" && task.status !== "failed").length;
  const done = tasks.filter((task) => task.status === "done").length;
  const failed = tasks.filter((task) => task.status === "failed").length;
  return (
    <View className="mx-4 mt-1 rounded-grouped border border-border bg-grouped px-3.5 py-2.5">
      <View className="flex-row gap-6">
        <View className="gap-0.5">
          <Typography.Paragraph weight="semibold" style={{ fontSize: 17 }}>
            {tasks.length}
          </Typography.Paragraph>
          <Typography.Paragraph type="body-xs" className="text-muted">
            {t("mobile.app.ledger.total")}
          </Typography.Paragraph>
        </View>
        <View className="gap-0.5">
          <Typography.Paragraph weight="semibold" className="text-warning-text" style={{ fontSize: 17 }}>
            {open}
          </Typography.Paragraph>
          <Typography.Paragraph type="body-xs" className="text-muted">
            {t("mobile.app.ledger.open")}
          </Typography.Paragraph>
        </View>
        <View className="gap-0.5">
          <Typography.Paragraph weight="semibold" className="text-success-text" style={{ fontSize: 17 }}>
            {done}
          </Typography.Paragraph>
          <Typography.Paragraph type="body-xs" className="text-muted">
            {t("mobile.app.ledger.done")}
          </Typography.Paragraph>
        </View>
        <View className="gap-0.5">
          <Typography.Paragraph weight="semibold" className="text-danger-text" style={{ fontSize: 17 }}>
            {failed}
          </Typography.Paragraph>
          <Typography.Paragraph type="body-xs" className="text-muted">
            {t("mobile.app.ledger.failed")}
          </Typography.Paragraph>
        </View>
      </View>
    </View>
  );
}
