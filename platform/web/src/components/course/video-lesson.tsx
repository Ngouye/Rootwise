"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/client-api";

type VideoLessonProps = {
  lessonId: number;
  src: string;
  startAt: number;
  completed: boolean;
  track: boolean;
};

/**
 * Lecteur vidéo HTML5 : reprend là où le membre s'était arrêté, enregistre la position toutes
 * les 15 s et à la pause, et marque la leçon terminée à 90 % du visionnage.
 */
export function VideoLesson({ lessonId, src, startAt, completed, track }: VideoLessonProps) {
  const router = useRouter();
  const video = useRef<HTMLVideoElement>(null);
  const lastSaved = useRef(0);
  const done = useRef(completed);

  useEffect(() => {
    const element = video.current;
    if (!element || !track) return;

    const save = (markCompleted: boolean) => {
      const position = Math.floor(element.currentTime);
      lastSaved.current = position;
      return apiFetch(`/lessons/${lessonId}/progress`, {
        method: "PUT",
        body: { positionSeconds: position, completed: markCompleted },
      }).catch(() => undefined);
    };

    const onTime = () => {
      if (!done.current && element.duration > 0 && element.currentTime / element.duration >= 0.9) {
        done.current = true;
        save(true).then(() => router.refresh());
      } else if (Math.abs(element.currentTime - lastSaved.current) >= 15) {
        save(false);
      }
    };
    const onPause = () => save(false);

    element.addEventListener("timeupdate", onTime);
    element.addEventListener("pause", onPause);
    return () => {
      element.removeEventListener("timeupdate", onTime);
      element.removeEventListener("pause", onPause);
    };
  }, [lessonId, track, router]);

  return (
    <video
      ref={video}
      src={src}
      controls
      preload="metadata"
      playsInline
      className="aspect-video w-full rounded-xl border bg-black"
      onLoadedMetadata={(event) => {
        const element = event.currentTarget;
        // Reprise, sauf si la vidéo était presque finie.
        if (startAt > 0 && startAt < element.duration - 5) element.currentTime = startAt;
      }}
    >
      Votre navigateur ne sait pas lire cette vidéo.
    </video>
  );
}
