interface CacheEntry<T> {
  value: T
  expiresAt: number
  createdAt: number
}

export class CacheService {
  private static store = new Map<string, CacheEntry<any>>()
  private static stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
  }

  /**
   * Set a cache entry with Time-To-Live in seconds (defaults to 5 minutes)
   */
  static set<T>(key: string, value: T, ttlSeconds: number = 300): void {
    const expiresAt = Date.now() + ttlSeconds * 1000
    this.store.set(key, {
      value,
      expiresAt,
      createdAt: Date.now(),
    })
    this.stats.sets++

    // Prevent unbounded memory growth by evicting expired keys if store gets large
    if (this.store.size > 2000) {
      this.evictExpired()
    }
  }

  /**
   * Get an entry from cache. Returns null if expired or not found.
   */
  static get<T>(key: string): T | null {
    const entry = this.store.get(key)
    if (!entry) {
      this.stats.misses++
      return null
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      this.stats.misses++
      return null
    }

    this.stats.hits++
    return entry.value as T
  }

  /**
   * Get an existing cached value or execute the fetcher function, cache the result, and return it.
   */
  static async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttlSeconds: number = 300
  ): Promise<T> {
    const cached = this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    const fresh = await fetchFn()
    this.set(key, fresh, ttlSeconds)
    return fresh
  }

  /**
   * Delete a specific cache key
   */
  static delete(key: string): boolean {
    const deleted = this.store.delete(key)
    if (deleted) this.stats.deletes++
    return deleted
  }

  /**
   * Invalidate all keys matching a prefix or pattern (e.g. "courses:tenant-123:")
   */
  static deletePattern(prefixOrPattern: string): number {
    let count = 0
    for (const key of this.store.keys()) {
      if (key.startsWith(prefixOrPattern) || key.includes(prefixOrPattern)) {
        this.store.delete(key)
        count++
      }
    }
    this.stats.deletes += count
    return count
  }

  /**
   * Clear all cached keys
   */
  static clear(): void {
    this.store.clear()
  }

  /**
   * Get performance metrics
   */
  static getStats() {
    const totalRequests = this.stats.hits + this.stats.misses
    const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0
    return {
      size: this.store.size,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: `${hitRate.toFixed(1)}%`,
      sets: this.stats.sets,
      deletes: this.stats.deletes,
    }
  }

  /**
   * Internal cleaner for expired keys
   */
  private static evictExpired(): void {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key)
      }
    }
  }
}

export default CacheService

