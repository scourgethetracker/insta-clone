import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, MessageCircle, UserPlus } from 'lucide-react';

const InstagramClone = () => {
  const [posts, setPosts] = useState([]);
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('caption', caption);
    formData.append('image', image);

    try {
      await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      fetchPosts();
      setCaption('');
      setImage(null);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleLike = async (postId) => {
    try {
      await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      fetchPosts();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async (postId) => {
    try {
      const formData = new FormData();
      formData.append('text', comment);

      await fetch(`/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      fetchPosts();
      setComment('');
    } catch (error) {
      console.error('Error commenting:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card className="mb-8">
        <CardHeader>Create Post</CardHeader>
        <CardContent>
          <form onSubmit={handlePostSubmit} className="space-y-4">
            <Input
              type="file"
              onChange={(e) => setImage(e.target.files[0])}
              className="w-full"
            />
            <Input
              type="text"
              placeholder="Write a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full"
            />
            <Button type="submit" className="w-full">
              Post
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className="w-full">
            <CardHeader className="flex items-center">
              <span className="font-bold">{post.user.username}</span>
              <Button variant="ghost" size="sm" className="ml-auto">
                <UserPlus className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <img
                src={post.image_url}
                alt={post.caption}
                className="w-full h-auto rounded"
              />
              <p>{post.caption}</p>
              
              <div className="flex gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(post.id)}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  {post.likes.length}
                </Button>
                <Button variant="ghost" size="sm">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {post.comments.length}
                </Button>
              </div>

              <div className="space-y-2">
                {post.comments.map((comment) => (
                  <div key={comment.id} className="text-sm">
                    <span className="font-bold mr-2">
                      {comment.user.username}
                    </span>
                    {comment.text}
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={() => handleComment(post.id)}
                  size="sm"
                >
                  Post
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default InstagramClone;
