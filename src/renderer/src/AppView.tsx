import { AppLoadingScreen } from "@zollybot/ui/features/account/AppLoadingScreen";
import { useText } from "@zollybot/ui/text";
import { createEffect, createSignal, Loading, Show } from "solid-js";
import { useProviderDetection } from "./features/custom-providers/provider-detection-context";
import { createLanguageStep } from "./features/onboarding/language-step";
import { useSetup } from "./features/onboarding/onboarding-context";
import { SetupReadError } from "./features/onboarding/SetupReadError";
import { useSetupProviderProps } from "./features/onboarding/setup-provider-props";
import { useServerScope } from "./features/servers/server-scope";
import { useServerSelection } from "./features/servers/server-selection";
import { useSettings } from "./features/settings/settings-context";
import { WhatsNewOverlay } from "./features/updates/WhatsNewOverlay";
import { QuitShortcutHint } from "./features/window/QuitShortcutHint";
import { FirstRunFlow, InitialSetup, LanguageStep } from "./lazy-views";
import { usePlatform } from "./platform";
import { reportWorkspaceReady } from "./renderer-timing";
import { WorkspaceShell } from "./WorkspaceShell";

let startupSplashPlayed = false;

export function skipStartupSplash(): void {
  startupSplashPlayed = true;
}

function LoadingScreen() {
  const { t } = useText();
  return <div class="initial-setup-screen" role="status" aria-label={t("app.loading")} />;
}

export function AppAccessGate() {
  const { t } = useText();
  const platform = usePlatform();
  const setup = useSetup();
  const scope = useServerScope();
  const setupProviders = useSetupProviderProps();
  const detection = useProviderDetection();
  const settings = useSettings();
  const { joinRemoteDuringSetup } = useServerSelection();
  const started = () => setup.setupLoaded() && platform.appInfo() !== null;
  const [splashShown, setSplashShown] = createSignal(!platform.landingPreview);
  const splashPlaysThrough = !startupSplashPlayed && platform.chatWindow === null;
  const [splashOpen, setSplashOpen] = createSignal(false);
  const splashMoving = () => splashShown() && !splashOpen();
  const [workspaceReady, setWorkspaceReady] = createSignal(false);
  const workspaceShown = () => setup.setupState()?.completed === true || !scope.connection.hasContent;
  const splashReady = () => started() && (!workspaceShown() || workspaceReady());
  const languageStep = createLanguageStep();

  createEffect(started, (ready) => {
    if (ready) performance.mark("zollybot:app-started");
  });
  createEffect(workspaceReady, (ready) => {
    if (ready && platform.chatWindow === null) reportWorkspaceReady();
  });

  return (
    <>
      <Show when={started()}>
        <Show
          when={languageStep.done()}
          fallback={
            <Loading fallback={<LoadingScreen />}>
              <LanguageStep
                variant={platform.appInfo()?.variant ?? "production"}
                reopened={languageStep.reopened()}
                onDone={languageStep.complete}
              />
            </Loading>
          }
        >
          <Show
            when={setup.setupState()?.completed}
            fallback={
              <Show
                when={scope.connection.hasContent}
                fallback={
                  <WorkspaceShell
                    account={() => ({
                      id: "local",
                      email: "local@zollybot.local",
                      name: "Local User",
                      avatarUrl: null,
                      analyticsEnabled: false,
                      chatColor: null,
                    })}
                    behindSplash={splashMoving}
                    onStartupReady={() => setWorkspaceReady(true)}
                  />
                }
              >
                <Show when={!setup.setupReadFailed()} fallback={<SetupReadError />}>
                  <Show
                    when={setup.pendingInviteUrl().trim()}
                    fallback={
                      <Loading fallback={<LoadingScreen />}>
                        <FirstRunFlow
                          {...setupProviders}
                          state={
                            setup.setupState() ?? { completed: false, preferredProvider: null, preferredModel: null }
                          }
                          platform={platform.appInfo()?.platform ?? "darwin"}
                          onSave={setup.saveSetup}
                          onAnalyticsChoice={(enabled, chosen) =>
                            settings.updateGeneralSettings(
                              { ...settings.generalSettings(), productAnalytics: enabled },
                              { analyticsChosen: chosen },
                            )
                          }
                          onProviderStepShown={detection.scanOnce}
                          logoVariant={platform.appInfo()?.variant ?? "production"}
                        />
                      </Loading>
                    }
                  >
                    <Loading fallback={<LoadingScreen />}>
                      <InitialSetup
                        {...setupProviders}
                        state={
                          setup.setupState() ?? { completed: false, preferredProvider: null, preferredModel: null }
                        }
                        platform={platform.appInfo()?.platform ?? "darwin"}
                        accountEmail={""}
                        inviteUrl={setup.pendingInviteUrl()}
                        onSave={setup.saveSetup}
                        onPreviewInvite={setup.previewInvite}
                        onJoinRemote={joinRemoteDuringSetup}
                        onLogout={async () => {}}
                      />
                    </Loading>
                  </Show>
                </Show>
              </Show>
            }
          >
            <WorkspaceShell
              account={() => ({
                id: "local",
                email: "local@zollybot.local",
                name: "Local User",
                avatarUrl: null,
                analyticsEnabled: false,
                chatColor: null,
              })}
              behindSplash={splashMoving}
              onStartupReady={() => setWorkspaceReady(true)}
            />
          </Show>
        </Show>
      </Show>
      <WhatsNewOverlay
        ready={
          !platform.chatWindow &&
          !splashShown() &&
          (setup.setupState()?.completed === true || !scope.connection.hasContent)
        }
      />
      <QuitShortcutHint />
      <Show when={splashShown()}>
        <AppLoadingScreen
          label={t("app.loading")}
          ready={splashReady()}
          quickExit={!splashPlaysThrough}
          onMountViews={() => setSplashOpen(true)}
          onExited={() => {
            startupSplashPlayed = true;
            setSplashShown(false);
          }}
        />
      </Show>
    </>
  );
}
