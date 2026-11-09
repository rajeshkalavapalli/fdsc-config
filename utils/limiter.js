// In-memory limiter: at most `max` hits per key within `windowMs`.
// Memory-only (cleared on restart); use a shared store if the API runs on several servers.
const createLimiter = ({ max, windowMs }) => {
    const hits = new Map(); // key -> timestamps

    const take = (key) => {
        const now = Date.now();
        const list = (hits.get(key) || []).filter((t) => now - t < windowMs);
        if (list.length >= max) {
            hits.set(key, list);
            return windowMs - (now - list[0]); // ms until a slot frees up
        }
        list.push(now);
        hits.set(key, list);
        return 0;
    };

    setInterval(() => {
        const now = Date.now();
        for (const [k, list] of hits) if (!list.some((t) => now - t < windowMs)) hits.delete(k);
    }, 10 * 60 * 1000).unref();

    return { take };
};

module.exports = { createLimiter };
