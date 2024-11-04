import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Grid,
  User,
  Link,
  Edit3,
  MapPin,
  Heart,
  MessageCircle,
  UserPlus,
  Search as SearchIcon
} from 'lucide-react';

const UserProfile = ({ username, onBack }) => {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    bio: '',
    website: '',
    profile_picture: null
  });

  useEffect(() => {
    fetchProfile();
    fetchUserPosts();
  }, [username]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/users/${username}/profile`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setProfile(data);
      setProfileForm({
        full_name: data.full_name || '',
        bio: data.bio || '',
        website: data.website || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const response = await fetch(`/api/users/${username}/posts`, {
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

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    
    Object.keys(profileForm).forEach(key => {
      if (profileForm[key]) {
        formData.append(key, profileForm[key]);
      }
    });

    try {
      await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleFollow = async () => {
    try {
      await fetch(`/api/users/${username}/follow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      fetchProfile();
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        Back to Feed
      </Button>
      
      {profile && (
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center gap-8">
            <div className="relative w-32 h-32">
              <img
                src={profile.profile_picture || '/api/placeholder/128/128'}
                alt={profile.username}
                className="rounded-full w-full h-full object-cover"
              />
              {username === profile.username && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute bottom-0 right-0"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-2xl font-bold">{profile.username}</h1>
                {username !== profile.username ? (
                  <Button onClick={handleFollow}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Follow
                  </Button>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                )}
              </div>
              
              <div className="flex gap-8 mb-4">
                <span><strong>{profile.posts_count}</strong> posts</span>
                <span><strong>{profile.followers_count}</strong> followers</span>
                <span><strong>{profile.following_count}</strong> following</span>
              </div>
              
              {profile.full_name && (
                <div className="font-bold mb-2">{profile.full_name}</div>
              )}
              {profile.bio && <div className="mb-2">{profile.bio}</div>}
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 flex items-center gap-1"
                >
                  <Link className="h-4 w-4" />
                  {profile.website}
                </a>
              )}
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-3 gap-1">
              {posts.map((post) => (
                <Dialog key={post.id}>
                  <DialogTrigger>
                    <div className="aspect-square relative group">
                      <img
                        src={post.image_url}
                        alt={post.caption}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-4">
                        <span className="flex items-center">
                          <Heart className="h-4 w-4 mr-1" />
                          {post.likes.length}
                        </span>
                        <span className="flex items-center">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          {post.comments.length}
                        </span>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Post</DialogTitle>
                    </DialogHeader>
                    <img
                      src={post.image_url}
                      alt={post.caption}
                      className="w-full h-auto"
                    />
                    <p>{post.caption}</p>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <Input
                type="file"
                onChange={(e) => setProfileForm({
                  ...profileForm,
                  profile_picture: e.target.files[0]
                })}
                accept="image/*"
              />
            </div>
            <div>
              <Input
                placeholder="Full Name"
                value={profileForm.full_name}
                onChange={(e) => setProfileForm({
                  ...profileForm,
                  full_name: e.target.value
                })}
              />
            </div>
            <div>
              <Textarea
                placeholder="Bio"
                value={profileForm.bio}
                onChange={(e) => setProfileForm({
                  ...profileForm,
                  bio: e.target.value
                })}
              />
            </div>
            <div>
              <Input
                placeholder="Website"
                value={profileForm.website}
                onChange={(e) => setProfileForm({
                  ...profileForm,
                  website: e.target.value
                })}
              />
            </div>
            <Button type="submit" className="w-full">
              Save Changes
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const InstagramClone = () => {
  const [currentView, setCurrentView] = useState('feed');
  const [selectedUsername, setSelectedUsername] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    if (currentView === 'feed') {
      fetchPosts();
    }
  }, [currentView]);

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

  const handleSearch = async () => {
    try {
      const response = await fetch(`/api/users/search?query=${searchQuery}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const handleUserClick = (username) => {
    setSelectedUsername(username);
    setCurrentView('profile');
    setSearchResults([]);
    setSearchQuery('');
  };

  if (currentView === 'profile') {
    return (
      <UserProfile 
        username={selectedUsername} 
        onBack={() => {
          setCurrentView('feed');
          setSelectedUsername(null);
        }}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-8">
        <div className="relative">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyUp={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch}>
              <SearchIcon className="h-4 w-4" />
            </Button>
          </div>
          
          {searchResults.length > 0 && (
            <Card className="absolute w-full mt-2 z-10">
              <CardContent className="p-2">
                {searchResults.map((user) => (
                  <div
                    key={user.username}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleUserClick(user.username)}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={user.profile_picture || '/api/placeholder/32/32'}
                        alt={user.username}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="font-medium">{user.username}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className="w-full">
            <CardHeader className="flex items-center">
              <div
                className="font-bold cursor-pointer flex items-center gap-2"
                onClick={() => handleUserClick(post.user.username)}
              >
                <img
                  src={post.user.profile_picture || '/api/placeholder/32/32'}
                  alt={post.user.username}
                  className="w-8 h-8 rounded-full"
                />
                {post.user.username}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <img
                src={post.image_url}
                alt={post.caption}
                className="w-full h-auto rounded"
              />
              <p>{post.caption}</p>
              
              <div className="flex gap-4">
                <Button variant="ghost" size="sm">
                  <Heart className="h-4 w-4 mr-2" />
                  {post.likes.length}
                </Button>
                <Button variant="ghost" size="sm">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {post.comments.length}
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
