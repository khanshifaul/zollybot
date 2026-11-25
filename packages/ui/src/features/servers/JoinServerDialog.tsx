import { AppLogo } from "@zollybot/brand";
import { INPUT_LIMITS } from "@zollybot/contracts/input-limits";
import type { JoinServerInput } from "@zollybot/contracts/ipc";
import {
  Alert,
  AlertContent,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  Dialog,
  ErrorReference,
  Field,
  Heading,
  IconButton,
  Input,
  OctagonX,
  Text,
  X,
} from "@zollybot/ui";
import { motionDuration, prefersReducedMotion } from "@zollybot/ui/utils";
import type { UserErrorDetails } from "@zollybot/user-errors";
import { createSignal, onCleanup, onSettled, Show, untrack } from "solid-js";
import { useText } from "../../text";

interface JoinServerDialogProps {
  inviteUrl: string;
  onClose: () => void;
  onJoin: (input: JoinServerInput) => Promise<void>;
}

type DialogPhase = "idle" | "connecting";

const INVITE_URL_PLACEHOLDER = "https://…/join?… · 100.x.y.z · [fd7a:…] · host.ts.net";

export function JoinServerDialog(props: JoinServerDialogProps) {
  const { t, errorDetails } = useText();
  const [inviteUrl, setInviteUrl] = createSignal(untrack(() => props.inviteUrl));
  const [phase, setPhase] = createSignal<DialogPhase>("idle");
  const [error, setError] = createSignal<UserErrorDetails | null>(null);
  const [rendered, setRendered] = createSignal(true);
  const [opened, setOpened] = createSignal(false);
  const [closing, setClosing] = createSignal(false);
  const [inputShaking, setInputShaking] = createSignal(false);
  const [errorShaking, setErrorShaking] = createSignal(false);
  let inviteInput: HTMLInputElement | undefined;
  let errorAlert: HTMLDivElement | undefined;
  let openFrame: number | undefined;
  let closeTimer: number | undefined;
  let inputShakeTimer: number | undefined;
  let errorShakeTimer: number | undefined;

  const busy = () => phase() !== "idle" || closing();
  const dialogTitle = () => t("server.join.title");
  const dialogDescription = () => t("server.join.description");

  onSettled(() => {
    openFrame = window.requestAnimationFrame(() => {
      openFrame = undefined;
      setOpened(true);
    });
  });

  onCleanup(() => {
    if (openFrame !== undefined) window.cancelAnimationFrame(openFrame);
    if (closeTimer !== undefined) window.clearTimeout(closeTimer);
    if (inputShakeTimer !== undefined) window.clearTimeout(inputShakeTimer);
    if (errorShakeTimer !== undefined) window.clearTimeout(errorShakeTimer);
  });

  async function connect(): Promise<void> {
    const normalizedInviteUrl = inviteUrl().trim();
    if (busy() || !normalizedInviteUrl) return;
    clearInputMotion();
    clearErrorMotion();
    setPhase("connecting");
    setError(null);
    try {
      await props.onJoin({ inviteUrl: normalizedInviteUrl });
      setPhase("idle");
      startClose();
    } catch (cause) {
      setError(errorDetails(cause, t("server.join.joinFailed")));
      setPhase("idle");
      queueMicrotask(showError);
    }
  }

  function requestClose(): void {
    if (busy()) return;
    startClose();
  }

  function startClose(): void {
    setClosing(true);
    setOpened(false);
    closeTimer = window.setTimeout(
      () => {
        closeTimer = undefined;
        setClosing(false);
        setRendered(false);
        props.onClose();
      },
      prefersReducedMotion() ? 0 : motionDuration("--modal-close-dur", 150),
    );
  }

  function showError(): void {
    if (errorAlert) {
      if (errorShakeTimer !== undefined) window.clearTimeout(errorShakeTimer);
      setErrorShaking(false);
      void errorAlert.offsetWidth;
      setErrorShaking(true);
      errorShakeTimer = window.setTimeout(() => {
        errorShakeTimer = undefined;
        setErrorShaking(false);
      }, shakeDuration() + 20);
      return;
    }
    if (!inviteInput) return;
    if (inputShakeTimer !== undefined) window.clearTimeout(inputShakeTimer);
    setInputShaking(false);
    void inviteInput.offsetWidth;
    setInputShaking(true);
    inputShakeTimer = window.setTimeout(() => {
      inputShakeTimer = undefined;
      setInputShaking(false);
    }, shakeDuration() + 20);
  }

  function clearInputMotion(): void {
    if (inputShakeTimer !== undefined) window.clearTimeout(inputShakeTimer);
    inputShakeTimer = undefined;
    setInputShaking(false);
  }

  function clearErrorMotion(): void {
    if (errorShakeTimer !== undefined) window.clearTimeout(errorShakeTimer);
    errorShakeTimer = undefined;
    setErrorShaking(false);
  }

  return (
    <Dialog.Root open={rendered()} onOpenChange={(open) => !open && requestClose()}>
      <Dialog.Portal>
        <Dialog.Overlay class="join-server-backdrop" data-motion={closing() ? "closing" : "open"}>
          <Dialog.Content
            as="section"
            class={`join-server-dialog t-modal${closing() ? " is-closing" : opened() ? " is-open" : ""}`}
            aria-busy={busy() ? "true" : undefined}
            onOpenAutoFocus={(event) => {
              event.preventDefault();
              if (!inviteUrl().trim()) queueMicrotask(() => inviteInput?.focus({ preventScroll: true }));
            }}
          >
            <Dialog.Title class="sr-only">{dialogTitle()}</Dialog.Title>
            <Dialog.Description class="sr-only">{dialogDescription()}</Dialog.Description>

            <IconButton
              class="join-server-close"
              label={t("common.close")}
              tooltip={t("common.close")}
              variant="ghost"
              disabled={busy()}
              data-cuelume-tap="close"
              onClick={requestClose}
            >
              <X />
            </IconButton>

            <div class="join-server-content">
              <form
                class="join-server-page"
                onSubmit={(event) => {
                  event.preventDefault();
                  void connect();
                }}
              >
                <header class="join-server-header join-server-header-entry">
                  <AppLogo variant="production" class="join-server-entry-logo" />
                  <Heading as="h2" size="lg">
                    {t("server.join.title")}
                  </Heading>
                  <Text tone="muted">{t("server.join.description")}</Text>
                </header>

                <Field
                  class={`join-server-field t-input-wrap${error() ? " is-error" : ""}`}
                  label={t("server.join.inviteLink")}
                  htmlFor="join-server-invite-url"
                  error={
                    error() ? (
                      <>
                        <span class="t-error-msg">{error()?.message}</span>
                        <ErrorReference reference={error()?.reference} />
                      </>
                    ) : undefined
                  }
                >
                  <Input
                    ref={(element) => (inviteInput = element)}
                    id="join-server-invite-url"
                    class={`join-server-link-input t-input${error() ? " is-error" : ""}${inputShaking() ? " is-shaking" : ""}`}
                    type="text"
                    inputmode="url"
                    autocomplete="off"
                    placeholder={INVITE_URL_PLACEHOLDER}
                    value={inviteUrl()}
                    onValueChange={(value) => {
                      clearInputMotion();
                      setInviteUrl(value);
                      setError(null);
                    }}
                    maxlength={INPUT_LIMITS.inviteUrl}
                    spellcheck={false}
                    disabled={busy()}
                    required
                  />
                </Field>

                <Show when={error()}>
                  {(failure) => (
                    <Alert
                      ref={(element) => (errorAlert = element)}
                      class={`join-server-alert t-input${errorShaking() ? " is-shaking" : ""}`}
                      tone="danger"
                      role="alert"
                    >
                      <AlertIcon>
                        <OctagonX />
                      </AlertIcon>
                      <AlertContent>
                        <AlertTitle>{t("server.join.connectionFailed")}</AlertTitle>
                        <AlertDescription>{failure().message}</AlertDescription>
                        <ErrorReference reference={failure().reference} />
                      </AlertContent>
                    </Alert>
                  )}
                </Show>

                <footer class="join-server-actions">
                  <Button
                    class="join-server-submit"
                    type="submit"
                    variant="default"
                    fullWidth
                    loading={phase() === "connecting"}
                    loadingLabel={t("common.connecting")}
                    disabled={!inviteUrl().trim() || busy()}
                  >
                    {t("server.join.connect")}
                  </Button>
                  <Button type="button" variant="ghost" disabled={busy()} onClick={requestClose}>
                    {t("common.cancel")}
                  </Button>
                </footer>
              </form>
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function shakeDuration(): number {
  return motionDuration("--shake-dur-a", 80) * 2 + motionDuration("--shake-dur-b", 60) * 2;
}
