import Image from "next/image";
import { Play, Copy } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";
import { fetchInstagramPosts } from "@/lib/instagram";

const PROFILE_URL = "https://www.instagram.com/goatsheritage";

export default async function InstagramFeed() {
  const posts = await fetchInstagramPosts(8);
  if (posts.length === 0) return null;

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center">
            <h2 className="text-3xl font-bold md:text-4xl">
              Follow the <span className="text-[#C8A84E]">Herd</span>
            </h2>
            <div className="mx-auto mt-3 h-px w-16 bg-[#C8A84E]/40" />
            <a
              href={PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-[#A3A3A3] transition-colors hover:text-[#C8A84E]"
            >
              @goatsheritage on Instagram
            </a>
          </div>
        </FadeIn>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {posts.map((post, i) => {
            const src = post.media_type === "VIDEO" ? post.thumbnail_url || post.media_url : post.media_url;
            const alt = post.caption ? post.caption.slice(0, 120) : "Goats Heritage on Instagram";
            return (
              <FadeIn key={post.id} delay={i * 60}>
                <a
                  href={post.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block aspect-square overflow-hidden rounded-xl border border-[#262626] bg-[#0A0A0A] transition-colors hover:border-[#C8A84E]"
                >
                  <Image
                    src={src}
                    alt={alt}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {post.media_type === "VIDEO" && (
                    <span className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white">
                      <Play className="h-3.5 w-3.5" fill="currentColor" />
                    </span>
                  )}
                  {post.media_type === "CAROUSEL_ALBUM" && (
                    <span className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white">
                      <Copy className="h-3.5 w-3.5" />
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/30" />
                </a>
              </FadeIn>
            );
          })}
        </div>

        <FadeIn delay={300}>
          <div className="mt-10 text-center">
            <a
              href={PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-lg border border-[#C8A84E] px-8 py-3 text-sm font-medium text-[#C8A84E] transition-colors hover:bg-[#C8A84E]/10"
            >
              View on Instagram
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
