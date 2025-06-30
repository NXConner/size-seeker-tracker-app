import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Filter, TrendingUp, MessageCircle, ExternalLink, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface RedditPost {
  id: string;
  title: string;
  author: string;
  score: number;
  num_comments: number;
  created_utc: number;
  url: string;
  selftext: string;
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
  const [timeFilter, setTimeFilter] = useState<'hour' | 'day' | 'week' | 'month' | 'year' | 'all'>('day');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPosts, setFilteredPosts] = useState<RedditPost[]>([]);

  useEffect(() => {
    fetchRedditPosts();
  }, [sortBy, timeFilter]);

  useEffect(() => {
    const filtered = posts.filter(post =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.selftext.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPosts(filtered);
  }, [posts, searchTerm]);

  const fetchRedditPosts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Using Reddit's JSON API
      const url = `https://www.reddit.com/r/gettingbigger/${sortBy}.json?t=${timeFilter}&limit=25`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch Reddit posts');
      }
      
      const data = await response.json();
      const redditPosts: RedditPost[] = data.data.children.map((child: any) => ({
        id: child.data.id,
        title: child.data.title,
        author: child.data.author,
        score: child.data.score,
        num_comments: child.data.num_comments,
        created_utc: child.data.created_utc,
        url: child.data.url,
        selftext: child.data.selftext,
        subreddit: child.data.subreddit,
        permalink: `https://www.reddit.com${child.data.permalink}`
      }));
      
      setPosts(redditPosts);
    } catch (err) {
      setError('Failed to load Reddit posts. Please try again later.');
      console.error('Error fetching Reddit posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now() / 1000;
    const diff = now - timestamp;
    
    if (diff < 3600) {
      const minutes = Math.floor(diff / 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (diff < 86400) {
      const hours = Math.floor(diff / 3600);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (diff < 2592000) {
      const days = Math.floor(diff / 86400);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else {
      const months = Math.floor(diff / 2592000);
      return `${months} month${months !== 1 ? 's' : ''} ago`;
    }
  };

  const formatScore = (score: number) => {
    if (score >= 1000) {
      return `${(score / 1000).toFixed(1)}k`;
    }
    return score.toString();
  };

  const truncateText = (text: string, maxLength: number = 200) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getPostCategory = (title: string, selftext: string) => {
    const content = (title + ' ' + selftext).toLowerCase();
    
    if (content.includes('routine') || content.includes('schedule')) return 'routine';
    if (content.includes('measurement') || content.includes('progress')) return 'progress';
    if (content.includes('safety') || content.includes('injury')) return 'safety';
    if (content.includes('equipment') || content.includes('pump')) return 'equipment';
    if (content.includes('question') || content.includes('help')) return 'question';
    return 'general';
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'routine': return 'bg-blue-100 text-blue-800';
      case 'progress': return 'bg-green-100 text-green-800';
      case 'safety': return 'bg-red-100 text-red-800';
      case 'equipment': return 'bg-purple-100 text-purple-800';
      case 'question': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'routine': return '📋';
      case 'progress': return '📊';
      case 'safety': return '🛡️';
      case 'equipment': return '🔧';
      case 'question': return '❓';
      default: return '📝';
    }
  };

  if (loading && posts.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <h2 className="text-2xl font-bold text-gray-800">Reddit Community</h2>
          <div></div>
        </div>
        
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        <h2 className="text-2xl font-bold text-gray-800">Reddit Community</h2>
        <Button onClick={fetchRedditPosts} variant="outline" className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Sort By</label>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hot">Hot</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="top">Top</SelectItem>
                  <SelectItem value="rising">Rising</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Time</label>
              <Select value={timeFilter} onValueChange={(value: any) => setTimeFilter(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hour">Past Hour</SelectItem>
                  <SelectItem value="day">Past Day</SelectItem>
                  <SelectItem value="week">Past Week</SelectItem>
                  <SelectItem value="month">Past Month</SelectItem>
                  <SelectItem value="year">Past Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-800 mb-4">{error}</p>
              <Button onClick={fetchRedditPosts} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts */}
      <div className="space-y-4">
        {filteredPosts.map((post) => {
          const category = getPostCategory(post.title, post.selftext);
          return (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={getCategoryColor(category)}>
                          {getCategoryIcon(category)} {category}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          by u/{post.author}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {post.title}
                      </h3>
                    </div>
                  </div>

                  {/* Content */}
                  {post.selftext && (
                    <p className="text-gray-600 text-sm">
                      {truncateText(post.selftext)}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="h-4 w-4" />
                        <span>{formatScore(post.score)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>{post.num_comments} comments</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatTime(post.created_utc)}</span>
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(post.permalink, '_blank')}
                      className="flex items-center space-x-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>View</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* No Results */}
      {filteredPosts.length === 0 && !loading && !error && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No posts found matching your search criteria.</p>
              <Button onClick={() => setSearchTerm('')} variant="outline">
                Clear Search
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading More */}
      {loading && posts.length > 0 && (
        <div className="text-center py-4">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Loading posts...</p>
        </div>
      )}
    </div>
  );
} 