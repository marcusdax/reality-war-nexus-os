import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Heart, MessageCircle, Share2, Trash2, Send, X } from "lucide-react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

interface Post {
  id: number;
  userId: number;
  content: string;
  mediaUrls?: string[];
  upvotes: number;
  downvotes: number;
  truthScore: string;
  verificationStatus: "verified" | "unverified" | "disputed";
  createdAt: Date;
  updatedAt: Date;
}

interface Comment {
  id: number;
  postId: number;
  userId: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function RealityStreamFeed() {
  const { user } = useAuth();
  const [newPostContent, setNewPostContent] = useState("");
  const [expandedPostId, setExpandedPostId] = useState<number | null>(null);
  const [commentContent, setCommentContent] = useState<Record<number, string>>({});

  // Queries
  const feedQuery = trpc.realityStream.getFeed.useQuery({
    limit: 20,
    offset: 0,
    sort: "recent",
  });

  const commentsQuery = trpc.realityStream.getComments.useQuery(
    { postId: expandedPostId || 0 },
    { enabled: !!expandedPostId }
  );

  // Mutations
  const createPostMutation = trpc.realityStream.create.useMutation({
    onSuccess: () => {
      setNewPostContent("");
      feedQuery.refetch();
      toast.success("Reality Stream post created!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create post");
    },
  });

  const upvoteMutation = trpc.realityStream.upvote.useMutation({
    onSuccess: () => {
      feedQuery.refetch();
    },
  });



  const createCommentMutation = trpc.realityStream.comment.useMutation({
    onSuccess: () => {
      setCommentContent({ ...commentContent, [expandedPostId || 0]: "" });
      if (expandedPostId) {
        commentsQuery.refetch();
      }
      feedQuery.refetch();
      toast.success("Comment posted!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to post comment");
    },
  });



  const handleCreatePost = async () => {
    if (!newPostContent.trim()) {
      toast.error("Post content cannot be empty");
      return;
    }

    await createPostMutation.mutateAsync({
      content: newPostContent,
    });
  };

  const handleUpvote = (postId: number) => {
    upvoteMutation.mutate({ postId });
  };



  const handlePostComment = async (postId: number) => {
    const content = commentContent[postId];
    if (!content?.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    await createCommentMutation.mutateAsync({
      postId,
      content,
    });
  };

  const handleDownvoteClick = (postId: number) => {
    // Downvote functionality not yet implemented in API
    toast.info("Downvote feature coming soon");
  };

  const handleDeletePost = (postId: number) => {
    toast.info("Post deletion coming soon");
  };

  return (
    <div className="space-y-6">
      {/* Create Post Section */}
      <Card className="card-sacred p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-400" />
            Share Your Reality
          </h3>
          <textarea
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="What truth have you discovered? What anomaly did you witness?"
            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 resize-none"
            rows={4}
          />
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setNewPostContent("")}
              disabled={!newPostContent.trim()}
            >
              Clear
            </Button>
            <Button
              className="btn-truth"
              onClick={handleCreatePost}
              disabled={!newPostContent.trim() || createPostMutation.isPending}
            >
              {createPostMutation.isPending ? "Posting..." : "Post to Reality Stream"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Feed */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white">Reality Stream Feed</h3>

        {feedQuery.isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Loading reality stream...</p>
          </div>
        ) : feedQuery.data && feedQuery.data.length > 0 ? (
          (feedQuery.data as any[]).map((post: any) => (
            <Card key={post.id} className="card-sacred p-6 space-y-4">
              {/* Post Header */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-white">User #{post.userId}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(post.createdAt).toLocaleString()}
                  </p>
                  <p className="text-xs text-cyan-400 mt-1">Truth Score: {post.truthScore}</p>
                </div>
                {user?.id === post.userId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeletePost(post.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Post Content */}
              <div className="text-gray-200">
                <Streamdown>{post.content}</Streamdown>
              </div>

              {/* Post Media */}
              {post.mediaUrls && (post.mediaUrls as string[]).length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {(post.mediaUrls as string[]).map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt="Post media"
                      className="rounded-lg max-h-48 object-cover"
                    />
                  ))}
                </div>
              )}

              {/* Post Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                <div className="flex items-center gap-6">

                  <button
                    onClick={() => setExpandedPostId(expandedPostId === post.id ? null : post.id)}
                    className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">Comment</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors">
                    <Share2 className="w-4 h-4" />
                    <span className="text-sm">Share</span>
                  </button>
                </div>
              </div>

              {/* Comments Section */}
              {expandedPostId === post.id && (
                <div className="pt-4 border-t border-slate-700 space-y-4">
                  {/* Comments List */}
                  {commentsQuery.data && commentsQuery.data.length > 0 ? (
                    <div className="space-y-3">
                      {commentsQuery.data && commentsQuery.data.map((comment: Comment) => (
                        <div key={comment.id} className="bg-slate-800/30 rounded-lg p-3">
                          <p className="text-sm font-semibold text-white">User #{comment.userId}</p>
                          <p className="text-sm text-gray-300 mt-1">{comment.content}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(comment.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No comments yet</p>
                  )}

                  {/* Comment Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={commentContent[post.id] || ""}
                      onChange={(e) =>
                        setCommentContent({
                          ...commentContent,
                          [post.id]: e.target.value,
                        })
                      }
                      placeholder="Add a comment..."
                      className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                    />
                    <Button
                      size="sm"
                      className="btn-truth"
                      onClick={() => handlePostComment(post.id)}
                      disabled={!commentContent[post.id]?.trim() || createCommentMutation.isPending}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">No posts in the Reality Stream yet. Be the first to share!</p>
          </div>
        )}
      </div>
    </div>
  );
}
