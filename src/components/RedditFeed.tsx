import React, { useState, useEffect } from 'react';
import { ArrowLeft, ExternalLink, RefreshCw, TrendingUp, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

interface RedditPost {
  id: string;
  title: string;
  author: string;
  score: number;
  numComments: number;
  created: number;
  url: string;
  selftext?: string;
  subreddit: string;
  permalink: string;
}

interface RedditFeedProps {
  onBack: () => void;
}

export default function RedditFeed({ onBack }: RedditFeedProps) {
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'hot' | 'new' | 'top' | 'rising'>('hot');
  const [timeFilter, setTimeFilter] = useState<'day' | 'week' | 'month' | 'year' | 'all'>('week');

  const fetchRedditPosts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `https://www.reddit.com/r/gettingbigger/${sortBy}.json?t=${timeFilter}&limit=25`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      
      const data = await response.json();
      const redditPosts: RedditPost[] = data.data.children.map((child: any) => ({
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
      toast({
        title: "Posts Loaded",
        description: `Loaded ${redditPosts.length} posts from r/gettingbigger`,
      });
    } catch (err) {
      setError('Failed to load posts. Please try again later.');
      toast({
        title: "Error",
        description: "Failed to load Reddit posts. Please check your connection.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRedditPosts();
  }, [sortBy, timeFilter]);

  const formatTime = (timestamp: number) => {
    const now = Date.now() / 1000;
    const diff = now - timestamp;
    
    if (diff < 3600) {
      const minutes = Math.floor(diff / 60);
      return `${minutes}m ago`;
    } else if (diff < 86400) {
      const hours = Math.floor(diff / 3600);
      return `${hours}h ago`;
    } else if (diff < 2592000) {
      const days = Math.floor(diff / 86400);
      return `${days}d ago`;
    } else {
      const months = Math.floor(diff / 2592000);
      return `${months}mo ago`;
    }
  };

  const formatScore = (score: number) => {
    if (score >= 1000) {
      return `${(score / 1000).toFixed(1)}k`;
    }
    return score.toString();
  };

  const openPost = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getPostPreview = (text: string) => {
    if (!text) return '';
    const maxLength = 200;
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        <h2 className="text-2xl font-bold text-gray-800">Reddit Community</h2>
        <Button variant="outline" onClick={fetchRedditPosts} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border rounded px-3 py-1 text-sm"
                aria-label="Sort by"
              >
                <option value="hot">Hot</option>
                <option value="new">New</option>
                <option value="top">Top</option>
                <option value="rising">Rising</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Time:</label>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as any)}
                className="border rounded px-3 py-1 text-sm"
                aria-label="Time"
              >
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
                <option value="year">Year</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts */}
      <div className="space-y-4">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : error ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchRedditPosts}>Try Again</Button>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 
                      className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors"
                      onClick={() => openPost(post.permalink)}
                    >
                      {post.title}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openPost(post.permalink)}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {post.selftext && (
                    <p className="text-gray-600 text-sm">
                      {getPostPreview(post.selftext)}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      <span>{formatScore(post.score)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{post.numComments} comments</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatTime(post.created)}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      u/{post.author}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Community Info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>About r/gettingbigger</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            A community dedicated to discussing safe and effective methods for male enhancement, 
            including pumping, stretching, and other techniques. Always prioritize safety and 
            consult with healthcare professionals.
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => openPost('https://reddit.com/r/gettingbigger')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Visit Community
            </Button>
            <Button
              variant="outline"
              onClick={() => openPost('https://reddit.com/r/gettingbigger/wiki/')}
            >
              Community Wiki
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 