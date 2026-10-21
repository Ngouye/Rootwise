import { ExternalLink } from "lucide-react";

/**
 * Vidéo YouTube intégrée (domaine youtube-nocookie : pas de cookie publicitaire tant que la vidéo
 * n'est pas lancée). La vidéo reste hébergée et comptabilisée chez son auteur.
 */
export function YouTubeLesson({ videoId, title }: { videoId: string; title: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="aspect-video w-full overflow-hidden rounded-xl border bg-black">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`}
          title={title}
          className="size-full"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
      <a
        href={`https://www.youtube.com/watch?v=${videoId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 self-end text-xs text-muted-foreground hover:text-foreground"
      >
        Voir sur YouTube <ExternalLink className="size-3" aria-hidden />
      </a>
    </div>
  );
}
