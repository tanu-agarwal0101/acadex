import { useEffect, useRef, useState } from "react";

type WorkboxLike = {
  addEventListener?: (event: string, handler: () => void) => void;
  messageSkipWaiting?: () => void;
};

const getWorkbox = () =>
  (window as unknown as { workbox?: WorkboxLike }).workbox;

export default function useSwUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const refreshingRef = useRef(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    const handleControllerChange = () => {
      if (refreshingRef.current) {
        window.location.reload();
      }
    };

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      handleControllerChange,
    );

    navigator.serviceWorker
      .getRegistration()
      .then((registration) => {
        if (!registration) {
          return;
        }
        registrationRef.current = registration;
        if (registration.waiting) {
          setUpdateAvailable(true);
        }
        registration.addEventListener("updatefound", () => {
          const installing = registration.installing;
          if (!installing) {
            return;
          }
          installing.addEventListener("statechange", () => {
            if (
              installing.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              setUpdateAvailable(true);
            }
          });
        });
      })
      .catch((error) => console.error(error));

    const workbox = getWorkbox();
    if (workbox?.addEventListener) {
      workbox.addEventListener("waiting", () => setUpdateAvailable(true));
    }

    return () => {
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        handleControllerChange,
      );
    };
  }, []);

  const handleRefresh = () => {
    if (refreshingRef.current) {
      return;
    }
    refreshingRef.current = true;

    const workbox = getWorkbox();
    if (workbox?.messageSkipWaiting) {
      workbox.messageSkipWaiting();
    }

    const registration = registrationRef.current;
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
      return;
    }

    window.location.reload();
  };

  return {
    updateAvailable,
    handleRefresh,
  };
}
