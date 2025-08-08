"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const badge_1 = require("@/components/ui/badge");
const skeleton_1 = require("@/components/ui/skeleton");
const use_toast_1 = require("@/hooks/use-toast");
function RedditFeed({ onBack }) {
    const [posts, setPosts] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [sortBy, setSortBy] = (0, react_1.useState)('hot');
    const [timeFilter, setTimeFilter] = (0, react_1.useState)('week');
    const fetchRedditPosts = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`https://www.reddit.com/r/gettingbigger/${sortBy}.json?t=${timeFilter}&limit=25`);
            if (!response.ok) {
                throw new Error('Failed to fetch posts');
            }
            const data = await response.json();
            const redditPosts = data.data.children.map((child) => ({
                id: child.data.id,
                title: child.data.title,
                author: child.data.author,
                score: child.data.score,
                numComments: child.data.num_comments,
                created: child.data.created_utc,
                url: child.data.url,
                selftext: child.data.selftext,
                subreddit: child.data.subreddit,
                permalink: `https://reddit.com${child.data.permalink}`
            }));
            setPosts(redditPosts);
            (0, use_toast_1.toast)({
                title: "Posts Loaded",
                description: `Loaded ${redditPosts.length} posts from r/gettingbigger`,
            });
        }
        catch (err) {
            setError('Failed to load posts. Please try again later.');
            (0, use_toast_1.toast)({
                title: "Error",
                description: "Failed to load Reddit posts. Please check your connection.",
                variant: "destructive",
            });
        }
        finally {
            setLoading(false);
        }
    };
    (0, react_1.useEffect)(() => {
        fetchRedditPosts();
    }, [sortBy, timeFilter]);
    const formatTime = (timestamp) => {
        const now = Date.now() / 1000;
        const diff = now - timestamp;
        if (diff < 3600) {
            const minutes = Math.floor(diff / 60);
            return `${minutes}m ago`;
        }
        else if (diff < 86400) {
            const hours = Math.floor(diff / 3600);
            return `${hours}h ago`;
        }
        else if (diff < 2592000) {
            const days = Math.floor(diff / 86400);
            return `${days}d ago`;
        }
        else {
            const months = Math.floor(diff / 2592000);
            return `${months}mo ago`;
        }
    };
    const formatScore = (score) => {
        if (score >= 1000) {
            return `${(score / 1000).toFixed(1)}k`;
        }
        return score.toString();
    };
    const openPost = (url) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };
    const getPostPreview = (text) => {
        if (!text)
            return '';
        const maxLength = 200;
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "max-w-4xl mx-auto", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-6", children: [(0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", onClick: onBack, className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ArrowLeft, { className: "h-4 w-4" }), (0, jsx_runtime_1.jsx)("span", { children: "Back" })] }), (0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-bold text-gray-800", children: "Reddit Community" }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", onClick: fetchRedditPosts, disabled: loading, children: (0, jsx_runtime_1.jsx)(lucide_react_1.RefreshCw, { className: `h-4 w-4 ${loading ? 'animate-spin' : ''}` }) })] }), (0, jsx_runtime_1.jsx)(card_1.Card, { className: "mb-6", children: (0, jsx_runtime_1.jsx)(card_1.CardContent, { className: "pt-6", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-wrap gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "text-sm font-medium mb-2 block", children: "Sort by:" }), (0, jsx_runtime_1.jsxs)("select", { value: sortBy, onChange: (e) => setSortBy(e.target.value), className: "border rounded px-3 py-1 text-sm", "aria-label": "Sort by", children: [(0, jsx_runtime_1.jsx)("option", { value: "hot", children: "Hot" }), (0, jsx_runtime_1.jsx)("option", { value: "new", children: "New" }), (0, jsx_runtime_1.jsx)("option", { value: "top", children: "Top" }), (0, jsx_runtime_1.jsx)("option", { value: "rising", children: "Rising" })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "text-sm font-medium mb-2 block", children: "Time:" }), (0, jsx_runtime_1.jsxs)("select", { value: timeFilter, onChange: (e) => setTimeFilter(e.target.value), className: "border rounded px-3 py-1 text-sm", "aria-label": "Time", children: [(0, jsx_runtime_1.jsx)("option", { value: "day", children: "Day" }), (0, jsx_runtime_1.jsx)("option", { value: "week", children: "Week" }), (0, jsx_runtime_1.jsx)("option", { value: "month", children: "Month" }), (0, jsx_runtime_1.jsx)("option", { value: "year", children: "Year" }), (0, jsx_runtime_1.jsx)("option", { value: "all", children: "All Time" })] })] })] }) }) }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-4", children: loading ? (
                // Loading skeletons
                Array.from({ length: 5 }).map((_, i) => ((0, jsx_runtime_1.jsx)(card_1.Card, { children: (0, jsx_runtime_1.jsx)(card_1.CardContent, { className: "pt-6", children: (0, jsx_runtime_1.jsxs)("div", { className: "space-y-3", children: [(0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-4 w-3/4" }), (0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-4 w-1/2" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-6 w-16" }), (0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-6 w-20" }), (0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-6 w-24" })] })] }) }) }, i)))) : error ? ((0, jsx_runtime_1.jsx)(card_1.Card, { children: (0, jsx_runtime_1.jsxs)(card_1.CardContent, { className: "pt-6 text-center", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-red-600 mb-4", children: error }), (0, jsx_runtime_1.jsx)(button_1.Button, { onClick: fetchRedditPosts, children: "Try Again" })] }) })) : (posts.map((post) => ((0, jsx_runtime_1.jsx)(card_1.Card, { className: "hover:shadow-md transition-shadow cursor-pointer", children: (0, jsx_runtime_1.jsx)(card_1.CardContent, { className: "pt-6", children: (0, jsx_runtime_1.jsxs)("div", { className: "space-y-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-start justify-between", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors", onClick: () => openPost(post.permalink), children: post.title }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "sm", onClick: () => openPost(post.permalink), children: (0, jsx_runtime_1.jsx)(lucide_react_1.ExternalLink, { className: "h-4 w-4" }) })] }), post.selftext && ((0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 text-sm", children: getPostPreview(post.selftext) })), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-4 text-sm text-gray-500", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-1", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.TrendingUp, { className: "h-4 w-4" }), (0, jsx_runtime_1.jsx)("span", { children: formatScore(post.score) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-1", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Users, { className: "h-4 w-4" }), (0, jsx_runtime_1.jsxs)("span", { children: [post.numComments, " comments"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-1", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Clock, { className: "h-4 w-4" }), (0, jsx_runtime_1.jsx)("span", { children: formatTime(post.created) })] }), (0, jsx_runtime_1.jsxs)(badge_1.Badge, { variant: "outline", className: "text-xs", children: ["u/", post.author] })] })] }) }) }, post.id)))) }), (0, jsx_runtime_1.jsxs)(card_1.Card, { className: "mt-6", children: [(0, jsx_runtime_1.jsx)(card_1.CardHeader, { children: (0, jsx_runtime_1.jsx)(card_1.CardTitle, { children: "About r/gettingbigger" }) }), (0, jsx_runtime_1.jsxs)(card_1.CardContent, { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 mb-4", children: "A community dedicated to discussing safe and effective methods for male enhancement, including pumping, stretching, and other techniques. Always prioritize safety and consult with healthcare professionals." }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", onClick: () => openPost('https://reddit.com/r/gettingbigger'), children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ExternalLink, { className: "h-4 w-4 mr-2" }), "Visit Community"] }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", onClick: () => openPost('https://reddit.com/r/gettingbigger/wiki/'), children: "Community Wiki" })] })] })] })] }));
}
exports.default = RedditFeed;
