import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { LucideArrowRight, LucideClock, LucideLoader2 } from "lucide-react";
import { motion } from "framer-motion";
import AnimateIn from "../../components/animations/AnimateIn";
import StaggerGroup, { staggerItem } from "../../components/animations/StaggerGroup";
import Button from "../../components/ui/Button";
import { useBlogPosts, useBlogCategories, useBlogTags, useNewsletterSubscribe } from "../../api/hooks";
import SEOHead from "../../lib/seo";
import SectionEyebrow from "../../components/ui/SectionEyebrow";
import { cn } from "../../lib/utils";
import type { BlogPostResponse } from "../../api/types";

function formatDate(value: string | null) {
  if (!value) return "Recently";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function postDate(post: BlogPostResponse) {
  return formatDate(post.publishedAt ?? post.createdAt);
}

function postMeta(post: BlogPostResponse) {
  const parts = [postDate(post), `${post.readTime} min read`];
  if (post.authorName) parts.push(post.authorName);
  return parts.join(" · ");
}

const PER_PAGE = 9;

const Blog = () => {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [accumulatedPosts, setAccumulatedPosts] = useState<BlogPostResponse[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const appendedPageRef = useRef(0);

  const { data: categories } = useBlogCategories();
  const { data: tags } = useBlogTags();
  const { data: blogData, isLoading, isError, isFetching } = useBlogPosts(
    { page, per_page: PER_PAGE, sort: "publishedAt", order: "desc" },
    { category: activeCategory ?? undefined, tag: activeTag ?? undefined },
  );
  const { mutate: subscribe, isPending: isSubscribing, isSuccess: isSubscribed, isError: isSubscribeError, error: subscribeError } = useNewsletterSubscribe();

  // Reset pagination whenever the active filters change.
  useEffect(() => {
    setPage(1);
    setTotalPages(1);
    setAccumulatedPosts([]);
    appendedPageRef.current = 0;
  }, [activeCategory, activeTag]);

  // Accumulate posts across pages so "Load more" appends rather than replaces.
  useEffect(() => {
    if (!blogData) return;
    setTotalPages(blogData.pagination.totalPages);
    if (page <= 1) {
      setAccumulatedPosts(blogData.data);
      appendedPageRef.current = 1;
    } else if (page > appendedPageRef.current) {
      setAccumulatedPosts((prev) => [...prev, ...blogData.data]);
      appendedPageRef.current = page;
    }
  }, [blogData, page]);

  const posts = accumulatedPosts;
  const featuredPost = posts[0];
  const remainingPosts = featuredPost ? posts.slice(1) : posts;
  const isInitialLoading = isLoading && posts.length === 0;
  const showError = isError && posts.length === 0;
  const canLoadMore = page < totalPages;

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault();
    subscribe({ email: newsletterEmail });
  };

  return (
    <main>
      <SEOHead title="Blog — Travel Medicine Advisory Global" description="Travel health tips, product updates, and behind-the-scenes from the TMAG team." path="/blog" />

      {/* ─── Hero ─── */}
      <AnimateIn as="section" className="flex flex-col items-center text-center pt-20 pb-12 px-6">
        <SectionEyebrow className="mb-6">The Dispatch</SectionEyebrow>
        <h1 className="text-5xl md:text-6xl lg:text-7xl leading-[0.9] text-heading font-serif max-w-3xl">
          Insights & <span className="italic">updates.</span>
        </h1>
        <p className="sm:text-lg text-body mt-6 max-w-xl leading-relaxed">
          Travel health tips, product updates, and behind-the-scenes from the TMAG team.
        </p>
      </AnimateIn>

      {/* ─── Category filters ─── */}
      {categories && categories.length > 0 && (
        <AnimateIn as="section" type="fade" className="px-8 lg:px-16 pb-6 max-w-5xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              className={cn(
                "rounded-xl px-4 py-2 text-sm font-semibold transition-colors duration-200",
                activeCategory === null
                  ? "bg-dark text-background-primary"
                  : "bg-button-secondary text-muted hover:text-heading",
              )}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.slug)}
                className={cn(
                  "rounded-xl px-4 py-2 text-sm font-semibold transition-colors duration-200",
                  activeCategory === category.slug
                    ? "bg-dark text-background-primary"
                    : "bg-button-secondary text-muted hover:text-heading",
                )}
              >
                {category.name}
              </button>
            ))}
          </div>
        </AnimateIn>
      )}

      {/* ─── Tag filters ─── */}
      {tags && tags.length > 0 && (
        <AnimateIn as="section" type="fade" className="px-8 lg:px-16 pb-10 max-w-5xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTag(null)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors duration-200",
                activeTag === null
                  ? "bg-dark text-background-primary"
                  : "bg-button-secondary text-muted hover:text-heading",
              )}
            >
              All tags
            </button>
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => setActiveTag(tag.slug)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors duration-200",
                  activeTag === tag.slug
                    ? "bg-dark text-background-primary"
                    : "bg-button-secondary text-muted hover:text-heading",
                )}
              >
                #{tag.name}
              </button>
            ))}
          </div>
        </AnimateIn>
      )}

      {/* ─── Featured post ─── */}
      <section className="px-8 lg:px-16 pb-16 max-w-5xl mx-auto">
        {isInitialLoading ? (
          <div className="bg-button-secondary rounded-2xl p-10 flex items-center justify-center text-muted">
            <LucideLoader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : showError ? (
          <div className="bg-button-secondary rounded-2xl p-8 md:p-10 text-center">
            <h2 className="text-2xl font-serif text-heading mb-2">Blog posts could not be loaded.</h2>
            <p className="text-sm text-body">Please try again later.</p>
          </div>
        ) : featuredPost ? (
          <AnimateIn type="fadeUp">
            <Link
              to={`/blog/${featuredPost.slug}`}
              className="group relative grid lg:grid-cols-2 bg-background-secondary rounded-3xl overflow-hidden border border-border-light hover:border-border transition-all duration-300"
            >
              {/* Featured badge */}
              <div className="absolute top-5 left-5 z-10 inline-flex items-center gap-1.5 bg-accent text-background-primary text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                Featured
              </div>

              {/* Image */}
              <div className="relative min-h-[280px] lg:min-h-full overflow-hidden">
                {featuredPost.featuredImageUrl ? (
                  <img
                    src={featuredPost.featuredImageUrl}
                    alt={featuredPost.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 bg-button-secondary" />
                )}
              </div>

              {/* Content */}
              <div className="p-8 md:p-10 lg:p-12 flex flex-col justify-center">
                {featuredPost.category && (
                  <span className="inline-block text-xs text-muted bg-background-primary font-semibold rounded-lg px-3 py-1 mb-4 self-start">
                    {featuredPost.category.name}
                  </span>
                )}
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif text-heading leading-tight mb-4 group-hover:text-accent transition-colors duration-200">
                  {featuredPost.title}
                </h2>
                <p className="text-sm md:text-base text-body leading-relaxed mb-6 max-w-xl">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center justify-between flex-wrap gap-4 mt-auto pt-4 border-t border-border-light/50">
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <LucideClock className="w-3.5 h-3.5" />
                    <span>{postMeta(featuredPost)}</span>
                  </div>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-heading group-hover:text-accent transition-colors duration-200">
                    Read article
                    <LucideArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </Link>
          </AnimateIn>
        ) : (
          <div className="bg-button-secondary rounded-2xl p-8 md:p-10 text-center">
            <h2 className="text-2xl font-serif text-heading mb-2">No published posts yet.</h2>
            <p className="text-sm text-body">Check back soon for travel health guidance from TMAG.</p>
          </div>
        )}
      </section>

      {/* ─── All posts grid ─── */}
      <div className="bg-background-secondary">
        <section className="px-8 lg:px-16 py-24 max-w-5xl mx-auto">
          <AnimateIn className="mb-10">
            <h2 className="text-2xl font-serif text-heading">All posts</h2>
          </AnimateIn>

          {isInitialLoading ? (
            <div className="flex items-center justify-center py-12 text-muted">
              <LucideLoader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : remainingPosts.length === 0 ? (
            <p className="text-sm text-muted">
              {featuredPost ? "No more posts yet." : "No published posts yet."}
            </p>
          ) : (
            <>
              <StaggerGroup stagger={0.06} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {remainingPosts.map((post) => (
                  <motion.div key={post.id} variants={staggerItem}>
                    <Link
                      to={`/blog/${post.slug}`}
                      className="group block bg-background-primary rounded-2xl overflow-hidden border border-border-light hover:border-border transition-all duration-200"
                    >
                      {/* Card image */}
                      {post.featuredImageUrl ? (
                        <div className="relative overflow-hidden">
                          <img
                            src={post.featuredImageUrl}
                            alt={post.title}
                            className="w-full aspect-video object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="w-full aspect-video bg-button-secondary" />
                      )}

                      {/* Card body */}
                      <div className="p-5">
                        {post.category && (
                          <span className="inline-block text-[11px] text-muted bg-button-secondary font-semibold rounded-md px-2 py-0.5 mb-3">
                            {post.category.name}
                          </span>
                        )}
                        <h3 className="text-lg font-serif text-heading leading-snug line-clamp-2 group-hover:text-accent transition-colors duration-200">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="text-sm text-body leading-relaxed line-clamp-2 mt-2">
                            {post.excerpt}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted mt-4 pt-3 border-t border-border-light">
                          <LucideClock className="w-3.5 h-3.5 shrink-0" />
                          <span>{postMeta(post)}</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </StaggerGroup>

              {canLoadMore && (
                <div className="flex justify-center mt-12">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setPage((prev) => prev + 1)}
                    disabled={isFetching}
                  >
                    {isFetching ? (
                      <span className="inline-flex items-center gap-2">
                        <LucideLoader2 className="w-4 h-4 animate-spin" />
                        Loading…
                      </span>
                    ) : (
                      "Load more"
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {/* ─── Editorial newsletter ─── */}
      <section className="bg-background-secondary border-y border-border-light">
        <div className="px-8 lg:px-16 py-24 max-w-4xl mx-auto text-center">
          <AnimateIn type="fade">
            <SectionEyebrow className="mb-4">The Dispatch</SectionEyebrow>
            <h2 className="text-3xl md:text-4xl text-heading leading-[1.1] font-serif mb-4">
              Get the travel health alert for your next destination.
            </h2>
            <p className="text-sm text-body leading-relaxed max-w-md mx-auto mb-8">
              Free in your inbox outbreak alerts, destination-specific guidance, and expert tips — straight from the TMAG editorial team.
            </p>
            {isSubscribed ? (
              <p className="text-sm text-accent font-medium">You&apos;re subscribed! Look for updates in your inbox.</p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-stretch gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 bg-button-secondary border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border-light outline-none focus:border-accent transition-colors duration-200"
                />
                <Button type="submit" variant="primary" disabled={isSubscribing}>
                  {isSubscribing ? "…" : "Subscribe"}
                </Button>
              </form>
            )}
            {isSubscribeError && (
              <p className="text-xs text-red-500 mt-3">
                {(subscribeError as { response?: { data?: { message?: string } } })?.response?.data?.message === "Already subscribed"
                  ? "You&apos;re already subscribed."
                  : "Something went wrong. Please try again."}
              </p>
            )}
          </AnimateIn>
        </div>
      </section>
    </main>
  );
};

export default Blog;
