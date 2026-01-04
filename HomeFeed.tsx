import { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Share2, MapPin, MoreVertical, Image as ImageIcon, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Post {
    id: string;
    user_id: string;
    content: string;
    photo_urls: string[];
    location_name: string;
    likes_count: number;
    comments_count: number;
    created_at: string;
    profiles: {
        full_name: string;
        profile_photo_url: string | null;
    };
    user_liked?: boolean;
}

export const HomeFeed = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [newPost, setNewPost] = useState('');
    const [posting, setPosting] = useState(false);
    const [tableReady, setTableReady] = useState(false);
    const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
    const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
    const [uploadingPhotos, setUploadingPhotos] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        checkTableAndFetch();

        // Subscribe to new posts
        const channel = supabase
            .channel('home-feed')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, () => {
                fetchPosts();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const checkTableAndFetch = async () => {
        try {
            // Test if posts table exists
            const { error } = await supabase
                .from('posts')
                .select('id')
                .limit(1);

            if (error) {
                console.warn('Posts table not ready:', error.message);
                setTableReady(false);
            } else {
                setTableReady(true);
                fetchPosts();
            }
        } catch (error) {
            console.error('Error checking posts table:', error);
            setTableReady(false);
        }
    };

    const fetchPosts = async () => {
        try {
            const { data, error } = await supabase
                .from('posts')
                .select(`
          id,
          user_id,
          content,
          photo_urls,
          location_name,
          likes_count,
          comments_count,
          created_at,
          profiles (full_name, avatar_url)
        `)
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;

            if (data) {
                setPosts(data.map(p => ({
                    ...p,
                    profiles: {
                        full_name: p.profiles?.full_name || 'User',
                        profile_photo_url: (p.profiles as any)?.avatar_url || null
                    }
                })) as Post[]);
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    };

    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        // Validate file types
        const validFiles = files.filter(file => file.type.startsWith('image/'));
        if (validFiles.length !== files.length) {
            toast({
                title: 'Invalid files',
                description: 'Only image files are allowed',
                variant: 'destructive'
            });
        }

        // Limit to 4 photos
        const photosToAdd = validFiles.slice(0, 4 - selectedPhotos.length);
        if (photosToAdd.length < validFiles.length) {
            toast({
                title: 'Photo limit',
                description: 'Maximum 4 photos per post',
                variant: 'destructive'
            });
        }

        // Create preview URLs
        const newPreviews = photosToAdd.map(file => URL.createObjectURL(file));
        setSelectedPhotos([...selectedPhotos, ...photosToAdd]);
        setPhotoPreviewUrls([...photoPreviewUrls, ...newPreviews]);
    };

    const handleRemovePhoto = (index: number) => {
        URL.revokeObjectURL(photoPreviewUrls[index]);
        setSelectedPhotos(selectedPhotos.filter((_, i) => i !== index));
        setPhotoPreviewUrls(photoPreviewUrls.filter((_, i) => i !== index));
    };

    const uploadPhotos = async (): Promise<string[]> => {
        if (selectedPhotos.length === 0) return [];

        setUploadingPhotos(true);
        try {
            const uploadPromises = selectedPhotos.map(async (file) => {
                const fileExt = file.name.split('.').pop();
                const filename = `post-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

                const { error } = await supabase.storage
                    .from('incident-media')
                    .upload(filename, file, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (error) throw error;

                const { data: urlData } = supabase.storage
                    .from('incident-media')
                    .getPublicUrl(filename);

                return urlData.publicUrl;
            });

            return await Promise.all(uploadPromises);
        } finally {
            setUploadingPhotos(false);
        }
    };

    const handleCreatePost = async () => {
        if (!newPost.trim() && selectedPhotos.length === 0) {
            toast({
                title: 'Empty post',
                description: 'Please add some text or photos',
                variant: 'destructive'
            });
            return;
        }

        if (!tableReady) {
            toast({
                title: 'Feature not ready',
                description: 'Database migration needed. Run: npx supabase db push',
                variant: 'destructive'
            });
            return;
        }

        setPosting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // Upload photos first
            const photoUrls = await uploadPhotos();

            // Get current location
            let location = null;
            let locationName = null;
            try {
                const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
                });
                const { latitude, longitude } = position.coords;
                location = `POINT(${longitude} ${latitude})`;
                locationName = 'Current location';
            } catch (error) {
                console.warn('Location not available:', error);
            }

            const { error } = await supabase.from('posts').insert({
                user_id: user.id,
                content: newPost || '',
                photo_urls: photoUrls,
                location,
                location_name: locationName,
            });

            if (error) throw error;

            // Clean up
            photoPreviewUrls.forEach(url => URL.revokeObjectURL(url));
            setNewPost('');
            setSelectedPhotos([]);
            setPhotoPreviewUrls([]);

            toast({ title: 'Posted!', description: 'Your update has been shared' });
            fetchPosts();
        } catch (error) {
            console.error('Error creating post:', error);
            toast({ title: 'Failed to post', description: 'Please try again', variant: 'destructive' });
        } finally {
            setPosting(false);
        }
    };

    const handleLike = async (postId: string) => {
        if (!tableReady) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const post = posts.find(p => p.id === postId);
            if (!post) return;

            const newLikesCount = post.user_liked ? post.likes_count - 1 : post.likes_count + 1;

            await supabase
                .from('posts')
                .update({ likes_count: newLikesCount })
                .eq('id', postId);

            setPosts(posts.map(p =>
                p.id === postId
                    ? { ...p, likes_count: newLikesCount, user_liked: !p.user_liked }
                    : p
            ));
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };

    const getTimeAgo = (dateString: string) => {
        const now = new Date();
        const then = new Date(dateString);
        const diffMs = now.getTime() - then.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    };

    if (!tableReady) {
        return (
            <div className="space-y-4">
                <h2 className="text-lg font-semibold">Community Feed</h2>
                <Card className="p-8 text-center">
                    <p className="text-muted-foreground mb-4">
                        Community feed is not ready yet.
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Run database migration: <code className="bg-muted px-2 py-1 rounded">npx supabase db push</code>
                    </p>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold">Community Feed</h2>

            {/* Create Post */}
            <Card className="p-4">
                <Textarea
                    placeholder="Share a safety update with your community..."
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    rows={3}
                    maxLength={500}
                />

                {/* Photo Previews */}
                {photoPreviewUrls.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mt-3">
                        {photoPreviewUrls.map((url, index) => (
                            <div key={index} className="relative group">
                                <img
                                    src={url}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-32 object-cover rounded-lg"
                                />
                                <button
                                    onClick={() => handleRemovePhoto(index)}
                                    className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={posting || selectedPhotos.length >= 4}
                        >
                            <ImageIcon className="h-4 w-4 mr-1" />
                            Photos ({selectedPhotos.length}/4)
                        </Button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handlePhotoSelect}
                            className="hidden"
                        />
                        <span className="text-xs text-muted-foreground">{newPost.length}/500</span>
                    </div>
                    <Button
                        onClick={handleCreatePost}
                        disabled={posting || uploadingPhotos || (!newPost.trim() && selectedPhotos.length === 0)}
                        size="sm"
                    >
                        {posting || uploadingPhotos ? 'Posting...' : 'Post'}
                    </Button>
                </div>
            </Card>

            {/* Posts Feed */}
            <div className="space-y-4">
                {posts.map((post) => (
                    <Card key={post.id} className="p-4">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={post.profiles?.profile_photo_url || undefined} />
                                    <AvatarFallback>
                                        {post.profiles?.full_name?.charAt(0) || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold text-sm">{post.profiles?.full_name || 'User'}</p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span>{getTimeAgo(post.created_at)}</span>
                                        {post.location_name && (
                                            <>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {post.location_name}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Content */}
                        <p className="text-sm mb-3 whitespace-pre-wrap">{post.content}</p>

                        {/* Photos */}
                        {post.photo_urls && post.photo_urls.length > 0 && (
                            <div className="grid grid-cols-2 gap-2 mb-3">
                                {post.photo_urls.slice(0, 4).map((url, index) => (
                                    <img
                                        key={index}
                                        src={url}
                                        alt="Post"
                                        className="w-full h-32 object-cover rounded-lg"
                                    />
                                ))}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-4 pt-2 border-t">
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`gap-2 ${post.user_liked ? 'text-red-500' : ''}`}
                                onClick={() => handleLike(post.id)}
                            >
                                <Heart className={`h-4 w-4 ${post.user_liked ? 'fill-current' : ''}`} />
                                <span className="text-xs">{post.likes_count}</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="gap-2">
                                <MessageCircle className="h-4 w-4" />
                                <span className="text-xs">{post.comments_count}</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="gap-2">
                                <Share2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </Card>
                ))}

                {posts.length === 0 && (
                    <Card className="p-8 text-center">
                        <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
                    </Card>
                )}
            </div>
        </div>
    );
};
